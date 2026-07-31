import { useState } from "react";

export default function App() {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState("empty");
  const isLoading = status === "loading";
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  

  async function runAudit(event) {
    event.preventDefault();
    if (!url.trim()) return;

    setStatus("loading");
    setError(null);
    setResult(null);
    
    
    try {
      const response = await fetch(`/audit?url=${encodeURIComponent(url.trim())}`);
      const body = await response.json();
      
      if (!response.ok) {
        setError(body.error ?? "something went wrong");
        setStatus("error");
        return;
      }
      
      setResult(body);
      setStatus("done");
      
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : String(caughtError)
      );
      setStatus("error");
    };
  };
  
  
  return (
    <main>
      <h1>Fix My Page</h1>


      <form onSubmit={runAudit}>
        <input
          type="url"
          value={url}
          onChange={event => setUrl(event.target.value)}
          placeholder="http://example.com"
          disabled={isLoading}
        />


      <button type="submit" disabled={isLoading}>
        {status === "loading" ? "Reading...." : "Audit"}
      </button>
      </form>


      {status === "loading" && <p>Fetching and parsing the page....</p>}
 
      {status === "error" && <p>Couldn't audit the page; {error}</p>}
 
      {status === "done" && (
        <section>
          <p>
            {result.problems.length} problem(s) on {result.url} {/* get rid of the ugly (s) with a conditional */}
          </p>
          <ul>
            {result.problems.map((problem, index) => (
              <li key={index}>{problem.type}</li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}