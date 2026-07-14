from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any, Optional
from backend.app.models.FestivalSchema import VoteRequest, CommentRequest
from app.services.database import MockDB

router = APIRouter(prefix="/social", tags=["social"])

@router.get("/groups", response_model=List[Dict[str, Any]])
def get_outfit_groups():
    """
    Get all active Outfit Circles.
    """
    groups = MockDB.get_outfit_groups()
    # Enrich product details inside the group items
    enriched_groups = []
    for g in groups:
        group_copy = g.copy()
        enriched_items = []
        for item in g["items"]:
            item_copy = item.copy()
            product = MockDB.get_product(item["product_id"])
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
    g = MockDB.get_outfit_group(group_id)
    if not g:
        raise HTTPException(status_code=404, detail="Outfit group not found")
    
    group_copy = g.copy()
    enriched_items = []
    for item in g["items"]:
        item_copy = item.copy()
        product = MockDB.get_product(item["product_id"])
        item_copy["product"] = product
        enriched_items.append(item_copy)
    group_copy["items"] = enriched_items
    return group_copy

@router.post("/vote")
def vote_outfit_item(req: VoteRequest):
    """
    Cast/toggle a vote on an item in an Outfit Circle.
    """
    item = MockDB.vote_item(req.group_id, req.item_id, req.user)
    if not item:
        raise HTTPException(status_code=404, detail="Outfit item or group not found")
    return {"status": "success", "item": item}

@router.post("/comment")
def add_outfit_comment(req: CommentRequest):
    """
    Post a comment on a styled item in an Outfit Circle.
    """
    item = MockDB.add_comment(req.group_id, req.item_id, req.user, req.text)
    if not item:
        raise HTTPException(status_code=404, detail="Outfit item or group not found")
    return {"status": "success", "item": item}

@router.post("/groups/create")
def create_group(name: str, creator: str):
    """
    Create a new Outfit Circle.
    """
    groups = MockDB.get_outfit_groups()
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
    group = MockDB.get_outfit_group(group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Outfit group not found")
        
    product = MockDB.get_product(product_id)
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
