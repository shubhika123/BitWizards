from typing import List, Optional, Dict, Any
from sqlmodel import Session, select
from app.models.ProductSchema import Product

class ProductRepository:
    
    @staticmethod
    def get_all_products(session: Session) -> List[Product]:
        """Fetches all products from the database."""
        return session.exec(select(Product)).all()

    @staticmethod
    def get_product_by_id(session: Session, product_id: str) -> Optional[Product]:
        """Fetches a single product by its unique string ID (e.g., 'top_001')."""
        return session.get(Product, product_id)

    @staticmethod
    def get_products_by_category(session: Session, category: str) -> List[Product]:
        """Fetches products filtered by category."""
        statement = select(Product).where(Product.category.ilike(f"%{category}%"))
        return session.exec(statement).all()

    @staticmethod
    def get_products_by_budget(session: Session, max_price: int) -> List[Product]:
        """Fetches products matching a strict maximum budget filter."""
        statement = select(Product).where(Product.price <= max_price)
        return session.exec(statement).all()

    @staticmethod
    def get_genie_products(session: Session) -> List[Product]:
        """Legacy helper for NLP parser - fetches all products and ensures categories match NLP enum."""
        products = ProductRepository.get_all_products(session)
        category_map = {
            "Topwear": "TOP",
            "Bottomwear": "BOTTOM",
            "Footwear": "FOOTWEAR",
            "Accessory": "ACCESSORY"
        }
        
        # We need to return them in a dictionary format because the gemini service 
        # manipulates the data heavily (it was originally built for dictionaries)
        output = []
        for p in products:
            p_dict = p.model_dump()
            p_dict["category"] = category_map.get(p.category, p.category)
            output.append(p_dict)
        return output

    @staticmethod
    def get_genie_product_by_id(session: Session, product_id: str) -> Optional[Dict[str, Any]]:
        for product in ProductRepository.get_genie_products(session):
            if product["id"] == product_id:
                return product
        return None
