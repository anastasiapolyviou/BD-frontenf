import React, { useState } from 'react';
import axios from 'axios';
import { Helmet } from 'react-helmet';

const BEDCalculator = () => {
  const [totalDose, setTotalDose] = useState('');
  const [totalBeamOn, setTotalBeamOn] = useState('');
  const [avgGapTime, setAvgGapTime] = useState('');
  const [isocentres, setIsocentres] = useState('');
  const [bed, setBed] = useState(null);
  const [a9, setA9] = useState(null);
  const [error, setError] = useState('');
  const [useGapArray, setUseGapArray] = useState(false);
  const [gapArray, setGapArray] = useState(''); // State for the gap time array input
  const [relDiff, setRelDiff] = useState(null);
  const [warning, setWarning] = useState(null); // Warning state
 





  const handleSubmit = async (event) => {
    event.preventDefault();

    // Validate inputs
    const totalDoseFloat = parseFloat(totalDose);
    const totalBeamOnFloat = parseFloat(totalBeamOn);
    const avgGapTimeFloat = parseFloat(avgGapTime);

    if (isNaN(totalDoseFloat) || totalDoseFloat < 0) {
      setError('Total dose must be a non-negative number.');
      return;
    }

    if (isNaN(totalBeamOnFloat) || totalBeamOnFloat < 0) {
      setError('Total beam-on time must be a non-negative number.');
      return;
    }

    // Validate isocentres
    const isocentresInt = parseInt(isocentres, 10);
    if (isNaN(isocentresInt) || isocentresInt <= 0 || isocentresInt > 50) {
      setError('Isocentres must be a positive integer between 1 and 50.');
      return;
    }

      // Validate gap time or gap array
    if (!useGapArray) {
      const avgGapTimeFloat = parseFloat(avgGapTime);
      if (isNaN(avgGapTimeFloat) || avgGapTimeFloat < 0) {
        setError('Average gap time must be a non-negative number.');
        return;
      }
    } else {
      const gapArrayValues = gapArray.split(',').map((val) => parseFloat(val.trim()));

      // Check if gapArray length matches isocentres - 1
      if (gapArrayValues.length !== isocentresInt - 1) {
        setError(`Gap time array should have ${isocentresInt - 1} values.`);
        return;
      }

      // Validate that all values in gapArray are non-negative
      if (gapArrayValues.some(isNaN) || gapArrayValues.some(val => val < 0)) {
        setError('Gap array must contain only non-negative numbers.');
        return;
      }
    }

    

    setError(''); // Clear any previous errors
    
    // Prepare the payload for the API request
    const requestData  = {
      totalDose: parseFloat(totalDose),
      totalBeamOn: parseFloat(totalBeamOn),
      isocentres: parseInt(isocentres),
    };


    if (useGapArray) {
      requestData.gapArray = gapArray.split(',').map((val) => parseFloat(val.trim()));
    } else {
      requestData.avgGapTime = avgGapTimeFloat;
    }

    try {
      const response = await axios.post('http://127.0.0.1:5000/calculate_BED', requestData);
      const { BED, A9, rel_diff, warning } = response.data;

      setBed(BED.toFixed(2) + ' Gy');
      setA9(A9.toFixed(2) + ' Gy');
      setRelDiff(rel_diff.toFixed(2) + '%');

      if (warning) {
        setWarning(warning);
      } else {
        setWarning(null); // Clear warning if there's none
      }
    } catch (error) {
      setError('An error occurred while calculating BED.');
    }
  };
    

  return (
    <div
      style={{
        backgroundColor: "#48003D",
        color: "white",
        minHeight: "100vh",
        padding: "40px 20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <Helmet>
        <title>BED Calculator | Radiotherapy Dose Calculator</title>
        <meta
          name="description"
          content="Use our BED calculator to compute the biologically effective dose based on total dose, beam-on time, and gap time."
        />
        <meta
          name="keywords"
          content="BED calculator, radiotherapy, dose, oncology, medical physics"
        />
      </Helmet>

      <h1 style={{ textAlign: "center", marginBottom: "30px" }}>BED Calculator</h1>

      <form
        onSubmit={handleSubmit}
        style={{
          maxWidth: "600px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        {/* Reusable row style */}
        <label style={{ display: "flex", alignItems: "center" }}>
          <span style={{ width: "220px", textAlign: "right", marginRight: "12px" }}>
            Total Dose (Gy):
          </span>
          <input
            type="text"
            value={totalDose}
            onChange={(e) => setTotalDose(e.target.value)}
            style={{
              flex: 1,
              padding: "8px",
              borderRadius: "6px",
              border: "none",
              outline: "none",
            }}
          />
        </label>

        <label style={{ display: "flex", alignItems: "center" }}>
          <span style={{ width: "220px", textAlign: "right", marginRight: "12px" }}>
            Total Beam On Time (mins):
          </span>
          <input
            type="text"
            value={totalBeamOn}
            onChange={(e) => setTotalBeamOn(e.target.value)}
            style={{
              flex: 1,
              padding: "8px",
              borderRadius: "6px",
              border: "none",
              outline: "none",
            }}
          />
        </label>

        <label style={{ display: "flex", alignItems: "center" }}>
          <span style={{ width: "220px", textAlign: "right", marginRight: "12px" }}>
            Isocentres:
          </span>
          <input
            type="number"
            min="1"
            max="50"
            value={isocentres}
            onChange={(e) => setIsocentres(e.target.value)}
            style={{
              flex: 1,
              padding: "8px",
              borderRadius: "6px",
              border: "none",
              outline: "none",
            }}
          />
        </label>

        <label style={{ display: "flex", alignItems: "center", gap: "10px"  }}>
          <input
            type="checkbox"
            checked={useGapArray}
            onChange={(e) => setUseGapArray(e.target.checked)}
            style={{
              width: "20px",
              height: "20px",
              accentColor: "#ff99cc", // bright pink check
              cursor: "pointer",
            }}
          />
            <span style={{ fontSize: "18px" }}>
              Use Gap Array instead of Average Gap Time
            </span>
        </label>

        {useGapArray ? (
          <label style={{ display: "flex", alignItems: "center" }}>
            <span style={{ width: "220px", textAlign: "right", marginRight: "12px" }}>
              Gap Time Array (mins):
            </span>
            <input
              type="text"
              placeholder="e.g., 0.1, 0.2, 0.3"
              value={gapArray}
              onChange={(e) => setGapArray(e.target.value)}
              style={{
                flex: 1,
                padding: "8px",
                borderRadius: "6px",
                border: "none",
                outline: "none",
              }}
            />
          </label>
        ) : (
          <label style={{ display: "flex", alignItems: "center" }}>
            <span style={{ width: "220px", textAlign: "right", marginRight: "12px" }}>
              Average Gap Time (mins):
            </span>
            <input
              type="text"
              value={avgGapTime}
              onChange={(e) => setAvgGapTime(e.target.value)}
              style={{
                flex: 1,
                padding: "8px",
                borderRadius: "6px",
                border: "none",
                outline: "none",
              }}
            />
          </label>
        )}

        <button
          type="submit"
          style={{
            marginTop: "10px",
            padding: "10px 20px",
            borderRadius: "6px",
            border: "none",
            backgroundColor: "#ff99cc",
            color: "#400030",
            fontWeight: "bold",
            cursor: "pointer",
            alignSelf: "center",
          }}
        >
          Calculate BED
        </button>
      </form>

      <div style={{ textAlign: "center", marginTop: "40px" }}>
        {error && <p style={{ color: "red" }}>{error}</p>}

        {bed !== null && (
          <>
            <h2>Millar BED Result:</h2>
            <p style={{ fontSize: "34px" }}>{bed}</p>
          </>
        )}

        {a9 !== null && (
          <>
            <h2>A9 Result:</h2>
            <p style={{ fontSize: "34px" }}>{a9}</p>
          </>
        )}

        {warning && <p style={{ color: "orange" }}>{warning}</p>}

        {relDiff !== null && (
          <>
            <h2>Relative Difference:</h2>
            <p style={{ fontSize: "34px" }}>{relDiff}</p>
          </>
        )}
      </div>
    </div>
  );
};


export default BEDCalculator;
