import { client } from "@gradio/client";

const spaces = [
    "Katiyar48/OOTDiffusion-VirtualTryOnClothing",
    "hikerxu/OOTDiffusion",
    "zhenghong/OOTDiffusion",
    "eduardo4547/OOTDiffusion",
    "cocktailpeanut/OOTDiffusion"
];

async function run() {
    for (const space of spaces) {
        try {
            console.log("Trying", space);
            const app = await client(space, { token: process.env.NEXT_PUBLIC_HF_TOKEN || "hf_dummy" });
            const endpoints = app.config.endpoints;
            const dc_endpoint = endpoints.find(e => e.api_name === "process_dc" || e.api_name === "/process_dc");
            if (dc_endpoint) {
                console.log("SUCCESS:", space);
                break;
            }
        } catch (err) {
            console.log("Failed", space);
        }
    }
}
run();
