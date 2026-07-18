import { client } from "@gradio/client";

async function run() {
    try {
        const app = await client("levihsu/OOTDiffusion", { token: process.env.NEXT_PUBLIC_HF_TOKEN || "hf_dummy" });
        console.log("Connected to OOTDiffusion");
        const endpoints = app.config.endpoints;
        const dc_endpoint = endpoints.find(e => e.api_name === "process_dc" || e.api_name === "/process_dc");
        if (dc_endpoint) {
            console.log(JSON.stringify(dc_endpoint.parameters, null, 2));
        } else {
            console.log("No process_dc endpoint found");
        }
    } catch (err) {
        console.error(err);
    }
}
run();
