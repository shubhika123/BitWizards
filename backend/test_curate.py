from app.api.genie import curate_genie_outfit
from app.models.GenieSchema import GenieCurateRequest

req = GenieCurateRequest(
    query="bhaiya ek badhiya sa onam ke liye white kasavu saree dikhao under 3k",
    occasion_category="Festive",
    target_items=["kasavu saree"],
    primary_color="white",
    aesthetic_tags=["traditional"],
    max_budget=3000
)

res = curate_genie_outfit(req)
print(res.model_dump_json(indent=2) if hasattr(res, "model_dump_json") else res.json(indent=2))
