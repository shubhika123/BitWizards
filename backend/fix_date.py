from app.database import engine
from sqlmodel import Session, select
from app.models.FestivalSchema import Festival

with Session(engine) as session:
    chhath = session.exec(select(Festival).where(Festival.name == "Chhath Puja")).first()
    if chhath:
        # Convert strings to datetime.date
        from datetime import date
        chhath.start_date = date(2026, 11, 16)
        chhath.end_date = date(2026, 11, 19)
        session.add(chhath)
        session.commit()
        print("Updated!")
    else:
        print("Not found")
