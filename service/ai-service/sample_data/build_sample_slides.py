from pathlib import Path

import pymupdf

SLIDES = [
    ("System Modeling", "System modeling is the process of developing abstract models of a system.\n"
     "Each model presents a different view or perspective of the system.\n"
     "Models are usually drawn with the Unified Modeling Language (UML)."),
    ("Four Perspectives", "External perspective: the context or environment of the system.\n"
     "Interaction perspective: interactions between the system and its environment.\n"
     "Structural perspective: the organisation of the system or its data.\n"
     "Behavioral perspective: the dynamic behavior of the system and how it responds to events."),
    ("Use Case Diagrams", "A use case represents a discrete task that involves external interaction with a system.\n"
     "Actors can be people or other systems.\n"
     "The include relationship always happens; the extend relationship happens only under a condition."),
    ("Sequence Diagrams", "Sequence diagrams show the interactions between actors and objects during one use case.\n"
     "Objects and actors are listed along the top, each with a dotted lifeline.\n"
     "Interactions are drawn as annotated arrows."),
    ("State Diagrams", "State diagrams model how a system reacts to internal and external events.\n"
     "Event-driven modeling assumes a finite number of states.\n"
     "A superstate groups several states and looks like a single state in a high-level model."),
]


def build(path: Path) -> None:
    doc = pymupdf.open()
    for title, body in SLIDES:
        page = doc.new_page(width=842, height=595)
        page.insert_text((60, 90), title, fontsize=28)
        page.insert_text((60, 150), body, fontsize=14)
    doc.save(path)


if __name__ == "__main__":
    target = Path(__file__).with_name("system-modeling-slides.pdf")
    build(target)
    print(f"Wrote {target.name}")
