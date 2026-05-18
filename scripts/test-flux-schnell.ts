import "dotenv/config";

async function testFluxSchnell() {
  const token = process.env.REPLICATE_API_TOKEN;
  console.log("Testing flux-schnell model...");

  // First, get the model info to find the correct version
  const modelRes = await fetch("https://api.replicate.com/v1/models/black-forest-labs/flux-schnell", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const modelData = await modelRes.json();
  console.log("Model info:", JSON.stringify(modelData, null, 2).substring(0, 500));

  if (modelData.latest_version) {
    const version = modelData.latest_version.id;
    console.log("\nLatest version:", version);

    // Create a prediction
    const predRes = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: version,
        input: {
          prompt: "A beautiful Japanese temple at sunset with cherry blossoms, hyperrealistic, detailed",
          aspect_ratio: "16:9",
          num_outputs: 1,
        },
      }),
    });

    const pred = await predRes.json();
    console.log("\nPrediction created:", pred);

    if (pred.urls?.get) {
      // Poll for result
      console.log("\nPolling for result...");
      let result = null;
      for (let i = 0; i < 60; i++) {
        await new Promise((r) => setTimeout(r, 1000));
        const getRes = await fetch(pred.urls.get, {
          headers: { Authorization: `Bearer ${token}` },
        });
        result = await getRes.json();
        console.log(`Status: ${result.status}`);
        if (result.status === "succeeded" || result.status === "failed") break;
      }

      console.log("\nFinal result:", JSON.stringify(result, null, 2).substring(0, 500));
    }
  }
}

testFluxSchnell().catch(console.error);