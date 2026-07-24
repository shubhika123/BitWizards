from typing import List, Dict, Any, Optional
from app.services.database import MockDB

class BazaarRepository:
    """
    Universal repository layer for Local Bazaar Boutiques.
    Abstracts all local shop queries away from the API routers.
    """

    @staticmethod
    def get_local_boutiques(city: Optional[str] = None) -> List[Dict[str, Any]]:
        return MockDB.get_boutiques(city)

    @staticmethod
    def get_local_bazaar_data(city: Optional[str] = None) -> Dict[str, Any]:
        return MockDB.get_local_bazaar_data(city)

    @staticmethod
    def get_bazaar_cities() -> List[Dict[str, str]]:
        return MockDB.get_bazaar_cities()
