from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any, Optional
from app.models.OutfitCircleSchema import VoteRequest, CommentRequest
from app.repository.product_repo import ProductRepository

router = APIRouter(prefix="/social", tags=["social"])

# Legacy route placeholder (use /outfit-circle instead)
_legacy_groups = []

@router.get("/groups", response_model=List[Dict[str, Any]])
def get_outfit_groups():
    """
    Get all active Outfit Circles.
    """
    groups = _legacy_groups
    # Enrich product details inside the group items
    enriched_groups = []
    for g in groups:
        group_copy = g.copy()
        enriched_items = []
        for item in g["items"]:
            item_copy = item.copy()
            product = ProductRepository.get_product_by_id(item["product_id"])
            item_copy["product"] = product
            enriched_items.append(item_copy)
        group_copy["items"] = enriched_items
        enriched_groups.append(group_copy)
    return enriched_groups

@router.get("/groups/{group_id}", response_model=Dict[str, Any])
def get_outfit_group(group_id: str):
    """
    Get details of a specific Outfit Circle.
    """
    g = next((g for g in _legacy_groups if g["id"] == group_id), None)
    if not g:
        raise HTTPException(status_code=404, detail="Outfit group not found")
    
    group_copy = g.copy()
    enriched_items = []
    for item in g["items"]:
        item_copy = item.copy()
        product = ProductRepository.get_product_by_id(item["product_id"])
        item_copy["product"] = product
        enriched_items.append(item_copy)
    group_copy["items"] = enriched_items
    return group_copy

@router.post("/vote")
def vote_outfit_item(req: VoteRequest):
    """
    Cast/toggle a vote on an item in an Outfit Circle.
    """
    return {"status": "success", "item": None}

@router.post("/comment")
def add_outfit_comment(req: CommentRequest):
    """
    Post a comment on a styled item in an Outfit Circle.
    """
    return {"status": "success", "item": None}

@router.post("/groups/create")
def create_group(name: str, creator: str):
    """
    Create a new Outfit Circle.
    """
    groups = _legacy_groups
    new_id = f"group_{len(groups) + 1}"
    new_group = {
        "id": new_id,
        "name": name,
        "members_count": 1,
        "creator": creator,
        "items": []
    }
    groups.append(new_group)
    return new_group

@router.post("/groups/{group_id}/add-item")
def add_item_to_group(group_id: str, product_id: str):
    """
    Add a product to an Outfit Circle to get feedback.
    """
    group = next((g for g in _legacy_groups if g["id"] == group_id), None)
    if not group:
        raise HTTPException(status_code=404, detail="Outfit group not found")
        
    product = ProductRepository.get_product_by_id(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    # Check if product already in group
    for item in group["items"]:
        if item["product_id"] == product_id:
            return {"status": "already_exists", "group": group}
            
    new_item_id = f"item_{len(group['items']) + 101}"
    new_item = {
        "id": new_item_id,
        "product_id": product_id,
        "votes": 0,
        "voted_by": [],
        "comments": []
    }
    group["items"].append(new_item)
    return {"status": "success", "group": group}
