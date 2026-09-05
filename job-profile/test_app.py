from app import parse_resume, match
def test_parse():
    p=parse_resume("Deepanraj A\n deepan@example.com\n +919876543210\n Python SQL Power BI\n Google Data Analytics")
    assert "Python" in p.skills and "SQL" in p.skills
    assert p.email=="deepan@example.com"
def test_match():
    p=parse_resume("Python SQL")
    r=match(p,{"title":"Data Analyst","skills":["Python","SQL","Tableau"]})
    assert r["score"]==67 and "tableau" in r["missing_skills"]
