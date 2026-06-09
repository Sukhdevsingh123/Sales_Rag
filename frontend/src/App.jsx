import { useState } from "react";

function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);


  // console.log(result.text);
  const uploadPdf = async () => {
    if (!file) {
      alert("Please select a PDF");
      return;
    }

    try {
      setLoading(true);
      setResult(null);

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        "http://127.0.0.1:9000/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(
          `HTTP Error ${response.status}`
        );
      }

      const data = await response.json();

      setResult(data);

    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }

    
  };

  return (
    <div
      style={{
        maxWidth: "1000px",
        margin: "40px auto",
        fontFamily: "Arial",
        padding: "20px",
      }}
    >
      <h1>PDF OCR Extractor</h1>

      <input
        type="file"
        accept=".pdf"
        onChange={(e) =>
          setFile(e.target.files[0])
        }
      />

      <br />
      <br />

      <button
        onClick={uploadPdf}
        disabled={loading}
      >
        {loading
          ? "Processing..."
          : "Upload & Extract"}
      </button>

      {result && (
        <div
          style={{
            marginTop: "30px",
            border: "1px solid #ccc",
            padding: "20px",
            borderRadius: "10px",
          }}
        >
          <h3>Extraction Result</h3>

          <p>
            <strong>File:</strong>{" "}
            {result.file_name}
          </p>

          <p>
            <strong>Method:</strong>{" "}
            {result.extraction_method}
          </p>

          <textarea
            value={result.text}
            readOnly
            rows={20}
            style={{
              width: "100%",
              marginTop: "10px",
            }}
          />
        </div>
      )}
    </div>
  );
}

export default App;