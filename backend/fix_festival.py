from sqlmodel import Session, select
from app.database import engine
from app.models.FestivalSchema import Festival
from datetime import date

with Session(engine) as session:
    festival = session.exec(select(Festival).where(Festival.name == "Raksha Bandhan")).first()
    if festival:
        festival.start_date = date(2026, 7, 1)
        session.add(festival)
        session.commit()
        print("Updated Raksha Bandhan start date to July 1, 2026.")
    else:
        print("Festival not found.")
