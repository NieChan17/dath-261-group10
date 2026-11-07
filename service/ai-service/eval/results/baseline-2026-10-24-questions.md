# RAG baseline – 2026-10-24 (questions.jsonl)

Model `BAAI/bge-m3`, top_k 5, 87 in-scope + 19 out-of-scope questions.

| Retrieval | n | Hit@1 | Hit@3 | Recall@5 | MRR |
| --- | --- | --- | --- | --- | --- |
| Hybrid (vector + full-text, RRF) | 87 | 78.2% | 93.1% | 96.6% | 0.856 |
| Vector only | 87 | 80.5% | 93.1% | 96.6% | 0.869 |
| Hybrid – en | 50 | 76.0% | 94.0% | 98.0% | 0.845 |
| Hybrid – vi | 37 | 81.1% | 91.9% | 94.6% | 0.870 |
| Hybrid – CO3001 | 72 | 80.6% | 94.4% | 95.8% | 0.869 |
| Hybrid – other courses | 15 | 66.7% | 86.7% | 100.0% | 0.793 |

| Answer metric | Value |
| --- | --- |
| Groundedness (answer text found in cited chunk) | 100.0% |
| Citation precision, citation [1] | 78.2% |
| Citation precision, all citations shown (max 3) | 44.1% |
| Median retrieval latency (embed + search, CPU) | 651.7 ms |

| OOS threshold | In-scope answered | Out-of-scope refused | Accuracy |
| --- | --- | --- | --- |
| 0.30 | 100.0% | 0.0% | 82.1% |
| 0.35 | 100.0% | 15.8% | 84.9% |
| 0.40 | 100.0% | 42.1% | 89.6% |
| 0.45 | 100.0% | 84.2% | 97.2% |
| 0.50 | 100.0% | 89.5% | 98.1% |
| 0.55 | 95.4% | 100.0% | 96.2% |
| 0.60 | 85.1% | 100.0% | 87.7% |
| 0.65 (current) | 60.9% | 100.0% | 67.9% |
| 0.70 | 31.0% | 100.0% | 43.4% |
| 0.75 | 8.0% | 100.0% | 24.5% |
| 0.80 | 1.1% | 100.0% | 18.9% |

| ID | Course | Lang | Top cosine | Rank hybrid | Rank vector | Top citation |
| --- | --- | --- | --- | --- | --- | --- |
| C01 | CO3001 | en | 0.788 | 2 | 1 | Slide 12 |
| C02 | CO3001 | vi | 0.652 | 1 | 1 | Slide 7 |
| C03 | CO3001 | en | 0.793 | 1 | 1 | Slide 12 |
| C04 | CO3001 | en | 0.719 | 1 | 1 | Slide 16 |
| C05 | CO3001 | vi | 0.702 | 1 | 1 | Slide 17 |
| C06 | CO3001 | en | 0.740 | 1 | 1 | Slide 18 |
| C07 | CO3001 | vi | 0.653 | 1 | 1 | Slide 19 |
| C08 | CO3001 | en | 0.661 | 1 | 1 | Slide 14 |
| C09 | CO3001 | en | 0.694 | 1 | 1 | Slide 8 |
| C10 | CO3001 | vi | 0.534 | 1 | 1 | Slide 8 |
| C11 | CO3001 | en | 0.708 | 1 | 1 | Slide 16 |
| C12 | CO3001 | en | 0.635 | 1 | 1 | Slide 22 |
| C13 | CO3001 | vi | 0.571 | 1 | 1 | Slide 27 |
| C14 | CO3001 | en | 0.793 | 1 | 1 | Slide 34 |
| C15 | CO3001 | vi | 0.686 | 1 | 1 | Slide 39 |
| C16 | CO3001 | en | 0.622 | 2 | 2 | Slide 41 |
| C17 | CO3001 | en | 0.665 | 1 | 1 | Slide 6 |
| C18 | CO3001 | vi | 0.749 | 1 | 1 | Slide 10 |
| C19 | CO3001 | en | 0.717 | 1 | 1 | Slide 13 |
| C20 | CO3001 | en | 0.688 | 2 | 2 | Slide 19 |
| C21 | CO3001 | vi | 0.637 | 1 | 1 | Slide 23 |
| C22 | CO3001 | en | 0.688 | 3 | 3 | Slide 27 |
| C23 | CO3001 | en | 0.635 | 1 | 1 | Slide 31 |
| C24 | CO3001 | vi | 0.660 | 1 | 1 | Slide 39 |
| C25 | CO3001 | en | 0.643 | 1 | 1 | Slide 18 |
| C26 | CO3001 | en | 0.677 | 1 | 1 | Slide 24 |
| C27 | CO3001 | vi | 0.636 | 5 | 5 | Slide 54 |
| C28 | CO3001 | en | 0.660 | 3 | 1 | Slide 35 |
| C29 | CO3001 | vi | 0.648 | 1 | 1 | Slide 5 |
| C30 | CO3001 | en | 0.659 | 1 | 1 | Slide 7 |
| C31 | CO3001 | en | 0.657 | 1 | 1 | Slide 11 |
| C32 | CO3001 | vi | 0.654 | 2 | 2 | Slide 42 |
| C33 | CO3001 | en | 0.727 | None | None | Slide 56 |
| C34 | CO3001 | en | 0.619 | 1 | 1 | Slide 27 |
| C35 | CO3001 | vi | 0.624 | 1 | 1 | Slide 35 |
| C36 | CO3001 | en | 0.753 | 3 | 3 | Slide 50 |
| C37 | CO3001 | vi | 0.553 | 1 | 1 | Slide 7 |
| C38 | CO3001 | en | 0.585 | 1 | 1 | Slide 10 |
| C39 | CO3001 | vi | 0.638 | 1 | 1 | Slide 10 |
| C40 | CO3001 | en | 0.632 | 1 | 1 | Slide 18 |
| C41 | CO3001 | en | 0.694 | 1 | 1 | Slide 21 |
| C42 | CO3001 | vi | 0.588 | 1 | 1 | Slide 26 |
| C43 | CO3001 | en | 0.736 | 3 | 3 | Slide 38 |
| C44 | CO3001 | en | 0.822 | 1 | 1 | Slide 33 |
| C45 | CO3001 | en | 0.700 | 1 | 1 | Slide 4 |
| C46 | CO3001 | vi | 0.608 | 1 | 1 | Slide 8 |
| C47 | CO3001 | en | 0.583 | 1 | 1 | Slide 8 |
| C48 | CO3001 | vi | 0.618 | 1 | 1 | Slide 13 |
| C49 | CO3001 | en | 0.650 | 1 | 1 | Slide 18 |
| C50 | CO3001 | vi | 0.672 | 1 | 1 | Slide 15 |
| C51 | CO3001 | en | 0.699 | 1 | 1 | Slide 40 |
| C52 | CO3001 | en | 0.742 | 1 | 1 | Slide 26 |
| C53 | CO3001 | vi | 0.701 | 1 | 1 | Slide 9 |
| C54 | CO3001 | en | 0.774 | 1 | 1 | Slide 23 |
| C55 | CO3001 | en | 0.737 | 1 | 1 | Slide 5 |
| C56 | CO3001 | vi | 0.741 | 1 | 1 | Slide 29 |
| C57 | CO3001 | en | 0.724 | 1 | 1 | Slide 34 |
| C58 | CO3001 | en | 0.705 | 1 | 1 | Slide 55 |
| C59 | CO3001 | vi | 0.641 | 1 | 1 | Slide 16 |
| C60 | CO3001 | en | 0.525 | 1 | 1 | Slide 7 |
| C61 | CO3001 | vi | 0.597 | 2 | 2 | Slide 19 |
| C62 | CO3001 | en | 0.649 | 1 | 1 | Slide 22 |
| C63 | CO3001 | en | 0.702 | 2 | 2 | Slide 27 |
| C64 | CO3001 | vi | 0.739 | 1 | 1 | Slide 3 |
| C65 | CO3001 | vi | 0.654 | 1 | 1 | Slide 2 |
| C66 | CO3001 | vi | 0.647 | 1 | 1 | Slide 7 |
| C67 | CO3001 | vi | 0.570 | None | None | Slide 5 |
| C68 | CO3001 | vi | 0.710 | 1 | 1 | Slide 7 |
| C69 | CO3001 | en | 0.679 | 1 | 1 | Slide 6 |
| C70 | CO3001 | vi | 0.637 | 1 | 1 | Slide 8 |
| C71 | CO3001 | vi | 0.577 | None | None | Slide 5 |
| C72 | CO3001 | en | 0.718 | 1 | 1 | Slide 48 |
| X01 | CO2003 | en | 0.681 | 5 | 5 | Slide 18 |
| X02 | CO2003 | vi | 0.612 | 1 | 1 | Slide 23 |
| X03 | CO2003 | vi | 0.761 | 1 | 1 | Slide 5 |
| X04 | CO2003 | en | 0.710 | 1 | 1 | Slide 26 |
| X05 | CO2003 | vi | 0.543 | 2 | 2 | Slide 32 |
| X06 | CO2003 | en | 0.744 | 5 | 5 | Slide 1 |
| X07 | CO2003 | vi | 0.700 | 1 | 1 | Slide 28 |
| X08 | CO3005 | en | 0.679 | 1 | 1 | Slide 5 |
| X09 | CO3005 | vi | 0.625 | 1 | 1 | Slide 2 |
| X10 | CO3005 | en | 0.697 | 1 | 1 | Slide 7 |
| X11 | CO3005 | en | 0.635 | 2 | 2 | Slide 25 |
| X12 | CO1023 | en | 0.606 | 1 | 1 | Slide 2 |
| X13 | CO1023 | vi | 0.593 | 2 | 2 | Bài tập Mạch TỔ HỢP > ĐẠI SỐ BOOLE VÀ CÁC CỔNG LUẬN LÝ > Hình 2 |
| X14 | CO1023 | en | 0.678 | 1 | 1 | Slide 41 |
| X15 | CO1023 | vi | 0.548 | 1 | 1 | Slide 18 |
| O01 | CO3001 | en | 0.315 | – | – | Slide 10 |
| O02 | CO3001 | en | 0.403 | – | – | Slide 44 |
| O03 | CO3001 | en | 0.376 | – | – | Slide 14 |
| O04 | CO3001 | en | 0.442 | – | – | Slide 41 |
| O05 | CO3001 | en | 0.448 | – | – | Slide 30 |
| O06 | CO3001 | en | 0.532 | – | – | Slide 27 |
| O07 | CO3001 | vi | 0.341 | – | – | Slide 38 |
| O08 | CO3001 | vi | 0.445 | – | – | Slide 8 |
| O09 | CO3001 | vi | 0.341 | – | – | Slide 4 |
| O10 | CO3001 | vi | 0.424 | – | – | Slide 36 |
| O11 | CO3001 | vi | 0.432 | – | – | Slide 35 |
| O12 | CO3001 | en | 0.385 | – | – | Slide 21 |
| O13 | CO3001 | vi | 0.394 | – | – | Slide 11 |
| O14 | CO3001 | vi | 0.480 | – | – | Slide 6 |
| O15 | CO3001 | en | 0.387 | – | – | Slide 10 |
| O16 | CO3001 | vi | 0.354 | – | – | Slide 5 |
| O17 | CO3001 | en | 0.444 | – | – | Slide 26 |
| O18 | CO3001 | vi | 0.523 | – | – | Slide 5 |
| O19 | CO3001 | en | 0.438 | – | – | Slide 8 |
