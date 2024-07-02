export function Layout({ children }) {
  return (
    <div className="App">
      <header className="App-header">
        <h1>
          <code>onCompleted</code> Demo
        </h1>
        <p>
          This reproduction demonstrates the differences for the{" "}
          <code>onCompleted</code> callback in 3.7 vs 3.8
        </p>
      </header>
      <div className="Grid-column">{children}</div>
    </div>
  );
}
