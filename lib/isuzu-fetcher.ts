// Enhanced utility to fetch content from ISUZU East Africa website and include comprehensive pricing data
export async function fetchIsuzuContent(query: string): Promise<string> {
  try {
    // Analyze query to determine relevant content
    const queryLower = query.toLowerCase()

    // Check if query is about pricing or specific truck models
    if (
      queryLower.includes("price") ||
      queryLower.includes("cost") ||
      queryLower.includes("rate") ||
      queryLower.includes("how much") ||
      queryLower.includes("pricing") ||
      queryLower.includes("bulletin")
    ) {
      // If query is about the complete price bulletin or all prices
      if (
        queryLower.includes("all") ||
        queryLower.includes("complete") ||
        queryLower.includes("bulletin") ||
        queryLower.includes("full") ||
        queryLower.includes("entire")
      ) {
        return `
# OFFICIAL TRUCK BODY PRICE BULLETIN (DOMESTIC)
## VALIDITY: 2022-2023

ISUZU East Africa
Enterprise/Mombasa Road, Industrial Area
P.O. Box 30527 – 00100, Nairobi, Kenya
Tel: +254 703 013 111
Email: info.kenya@isuzu.co.ke
Website: www.isuzutrucks.co.ke

### NLR77E Models
| Body Description | Price (KES - VAT Inclusive) |
|-----------------|----------------------------|
| NLR FULLY ENCLOSED STEEL BODY(CORRUG/PLAIN) | 311,000.00 |
| NLR FIXED HIGH SIDED STEEL BODY (CORRUG/PLAIN) | 283,000.00 |
| NLR77E MILK TANKER 2,500L (Stainless Steel) | 952,000.00 |

### NMR85H Models
| Body Description | Price (KES - VAT Inclusive) |
|-----------------|----------------------------|
| NMR FULLY ENCLOSED STEEL BODY(CORRUG/PLAIN) | 378,000.00 |
| NMR FIXED HIGH SIDED STEEL BODY(CORRUG/PLAIN) | 355,000.00 |
| NMR DOUBLE DROPSIDE STEEL BODY(CORRUG/PLAIN) | 378,000.00 |
| NMR LOW DROPSIDE STEEL BODY(CORRUG/PLAIN) | 283,000.00 |
| NMR85H MILK TANKER 3,500L (Stainless Steel) | 1,056,000.00 |

### NQR81K Models
| Body Description | Price (KES - VAT Inclusive) |
|-----------------|----------------------------|
| NQR-K FULLY ENCLOSED STEEL BODY(CORRUG/PLAIN) | 449,000.00 |
| NQR-K FIXED HIGH SIDED STEEL BODY(CORRUG/PLAIN) | 407,000.00 |
| NQR-K DOUBLE DROPSIDE STEEL BODY(CORRUG/PLAIN) | 406,000.00 |
| NQR-K LOW DROPSIDE STEEL BODY(CORRUG/PLAIN) | 306,000.00 |
| NQR-K TIPPER | 1,485,000.00 |
| NQR81K WATER TANKER 5,000L (Mild Steel) | 1,152,000.00 |
| NQR81K WATER TANKER 5,000L (Stainless Steel) | 1,589,000.00 |
| NQR81K MILK TANKER 5,0000L (Stainless Steel) | 1,591,000.00 |
| NQR81K FUEL TANKER 5,000L (Mild Steel) | 1,413,000.00 |

### NPS81UH Models
| Body Description | Price (KES - VAT Inclusive) |
|-----------------|----------------------------|
| NPS CARGO CARRIER- KDF | 946,000.00 |

### NQR81M Models
| Body Description | Price (KES - VAT Inclusive) |
|-----------------|----------------------------|
| NQR81M FULLY ENCLOSED STEEL BODY(CORRUG/PLAIN) | 538,000.00 |
| NQR81M FIXED HIGH SIDED STEEL BODY(CORRUG/PLAIN) | 516,000.00 |
| NQR81M DOUBLE DROPSIDE STEEL BODY(CORRUG/PLAIN) | 526,000.00 |
| NQR81M LOW DROPSIDE STEEL BODY(CORRUG/PLAIN) | 425,000.00 |
| NQR81M FUEL TANKER 6,000L (Mild Steel) | 1,558,000.00 |
| NQR81M MILK TANKER 6,000L (Stainless Steel) | 1,761,000.00 |
| NQR81M WATER TANKER 6,000L (Mild Steel) | 1,209,000.00 |
| NQR81M WATER TANKER 6,000L (Stainless Steel) | 1,636,000.00 |

### FRR90N Models
| Body Description | Price (KES - VAT Inclusive) |
|-----------------|----------------------------|
| FRR90N FULLY ENCLOSED STEEL BODY(CORRUG/PLAIN) | 550,000.00 |
| FRR90N FIXED HIGH SIDED STEEL BODY(CORRUG/PLAIN) | 527,000.00 |
| FRR90N DOUBLE DROPSIDE STEEL BODY(CORRUG/PLAIN) | 537,000.00 |
| FRR90N LOW DROPSIDE STEEL BODY(CORRUG/PLAIN) | 422,000.00 |
| FRR90N FUEL TANKER 8,500L (Mild Steel) | 2,042,000.00 |
| FRR90N MILK TANKER 8,500L (Stainless Steel) | 2,398,000.00 |
| FRR90N WATER TANKER 8,500L (Mild Steel) | 1,589,000.00 |
| FRR90N WATER TANKER 8,500L (Stainless Steel) | 2,299,000.00 |

### FVR90L Models
| Body Description | Price (KES - VAT Inclusive) |
|-----------------|----------------------------|
| FVR90L FULLY ENCLOSED STEEL BODY(CORRUG/PLAIN) | 521,000.00 |
| FVR90L FIXED HIGH SIDED STEEL BODY(CORRUG/PLAIN) | 515,000.00 |
| FVR90L DOUBLE DROPSIDE STEEL BODY(CORRUG/PLAIN) | 527,000.00 |
| FVR90L LOW DROPSIDE STEEL BODY(CORRUG/PLAIN) | 433,000.00 |
| FVR90L DOUBLE DROPSIDE STEEL BODY(SAND HARVESTER) | 580,000.00 |
| FVR90L LOW DROPSIDE STEEL BODY(SAND HARVESTER) | 487,000.00 |
| FVR90L TIPPER | 1,716,000.00 |
| FVR90L FUEL TANKER 11,000L (Mild Steel) | 2,181,000.00 |
| FVR90L MILK TANKER 11,000L (Stainless Steel) | 2,686,000.00 |
| FVR90L WATER TANKER 11,000L (Mild Steel) | 1,843,000.00 |
| FVR90L WATER TANKER 11,0000L (Stainless Steel) | 2,459,000.00 |

### FTS34L Models
| Body Description | Price (KES - VAT Inclusive) |
|-----------------|----------------------------|
| FTS TROOP CARRIER -KDF | 2,111,000.00 |
| FTS TROOP CARRIER-KNPS | 909,000.00 |
| FTS34L WATER TANKER 7,500L (Mild Steel) | 1,428,000.00 |
| FTS34L WATER TANKER 7,500L (Stainless Steel) | 2,315,000.00 |
| FTS34L FUEL TANKER 7,500L (Mild Steel) | 1,709,000.00 |
| FTS34L MILK TANKER 7,500L (Stainless Steel) | 2,090,000.00 |

### FVR34P Models
| Body Description | Price (KES - VAT Inclusive) |
|-----------------|----------------------------|
| FVR FULLY ENCLOSED STEEL BODY(CORRUG/PLAIN) | 602,000.00 |
| FVR FIXED HIGH SIDED STEEL BODY(CORRUG/PLAIN) | 579,000.00 |
| FVR DOUBLE DROPSIDE STEEL BODY(CORRUG/PLAIN) | 584,000.00 |
| FVR LOW DROPSIDE STEEL BODY(CORRUG/PLAIN) | 487,000.00 |
| FVR DOUBLE DROPSIDE STEEL BODY(SAND HARVESTER) | 674,000.00 |
| FVR LOW DROPSIDE STEEL BODY(SAND HARVESTER) | 542,000.00 |
| FVR TIPPER | 1,869,000.00 |
| FVR34P MILK TANKER 12,000L (Stainless Steel) | 3,053,000.00 |
| FVR34P WATER TANKER 12,000L (Mild Steel) | 1,825,000.00 |
| FVR34P WATER TANKER 12,000L (Stainless Steel) | 2,533,000.00 |
| FVR34P FUEL TANKER 12,000L (Mild Steel) | 2,315,000.00 |

### FVZ34T Models
| Body Description | Price (KES - VAT Inclusive) |
|-----------------|----------------------------|
| FVZ FULLY ENCLOSED STEEL BODY(CORRUG/PLAIN) | 714,000.00 |
| FVZ FIXED HIGH SIDED STEEL BODY(CORRUG/PLAIN) | 676,000.00 |
| FVZ DOUBLE DROPSIDE STEEL BODY(CORRUG/PLAIN) | 705,000.00 |
| FVZ LOW DROPSIDE STEEL BODY(CORRUG/PLAIN) | 553,000.00 |
| FVZ DOUBLE DROPSIDE STEEL BODY(SAND HARVESTER) | 749,000.00 |
| FVZ LOW DROPSIDE STEEL BODY(SAND HARVESTER) | 575,000.00 |
| FVZ TIPPER (15CM/12CM) - WITH FRONT TIPPING KIT (Provided by IEA) | 1,353,000.00 |
| FVZ TIPPER (15CM/12CM) - WITH UNDERBODY TIPPING KIT (Provided by IEA) | 1,353,000.00 |
| FVZ34T FUEL TANKER 16,000L (Mild Steel) | 2,346,000.00 |
| FVZ34T MILK TANKER 16,000L (Stainless Steel) | 3,118,000.00 |
| FVZ34T WATER TANKER 16,000L (Mild Steel) | 1,980,000.00 |
| FVZ34T WATER TANKER 16,000L (Stainless Steel) | 3,118,000.00 |

### TF-SC Models
| Body Description | Price (KES - VAT Inclusive) |
|-----------------|----------------------------|
| TF NATION BODY | 139,000.00 |
| TF STEEL BODY (CORRUG/PLAIN/WIREMESH) | 139,000.00 |
| TF MATATU BODY | 222,000.00 |

*Prices are valid for 2022-2023, are VAT inclusive, and are subject to change. Contact your nearest ISUZU dealer for the most current pricing.*
        `
      }

      // If query mentions specific truck models, return pricing for those models
      if (queryLower.includes("nlr") || queryLower.includes("nlr77e")) {
        return `
## ISUZU NLR77E Truck Body Pricing (2022-2023)

The NLR77E is ISUZU's light-duty truck model. Below are the official body prices:

| Body Description | Price (KES - VAT Inclusive) |
|-----------------|----------------------------|
| NLR FULLY ENCLOSED STEEL BODY(CORRUG/PLAIN) | 311,000.00 |
| NLR FIXED HIGH SIDED STEEL BODY (CORRUG/PLAIN) | 283,000.00 |
| NLR77E MILK TANKER 2,500L (Stainless Steel) | 952,000.00 |

*Prices are valid for 2022-2023 and are subject to change. Contact your nearest ISUZU dealer for the most current pricing.*

For more information, contact:
ISUZU East Africa
Enterprise/Mombasa Road, Industrial Area
P.O. Box 30527 – 00100, Nairobi, Kenya
Tel: +254 703 013 111
Email: info.kenya@isuzu.co.ke
Website: www.isuzutrucks.co.ke
        `
      }

      if (queryLower.includes("nmr") || queryLower.includes("nmr85h")) {
        return `
## ISUZU NMR85H Truck Body Pricing (2022-2023)

The NMR85H is a medium-duty truck in ISUZU's N-Series. Below are the official body prices:

| Body Description | Price (KES - VAT Inclusive) |
|-----------------|----------------------------|
| NMR FULLY ENCLOSED STEEL BODY(CORRUG/PLAIN) | 378,000.00 |
| NMR FIXED HIGH SIDED STEEL BODY(CORRUG/PLAIN) | 355,000.00 |
| NMR DOUBLE DROPSIDE STEEL BODY(CORRUG/PLAIN) | 378,000.00 |
| NMR LOW DROPSIDE STEEL BODY(CORRUG/PLAIN) | 283,000.00 |
| NMR85H MILK TANKER 3,500L (Stainless Steel) | 1,056,000.00 |

*Prices are valid for 2022-2023 and are subject to change. Contact your nearest ISUZU dealer for the most current pricing.*

For more information, contact:
ISUZU East Africa
Enterprise/Mombasa Road, Industrial Area
P.O. Box 30527 – 00100, Nairobi, Kenya
Tel: +254 703 013 111
Email: info.kenya@isuzu.co.ke
Website: www.isuzutrucks.co.ke
        `
      }

      if (queryLower.includes("nqr") || queryLower.includes("nqr81k") || queryLower.includes("nqr81m")) {
        return `
## ISUZU NQR Truck Body Pricing (2022-2023)

The NQR is a popular medium-heavy duty truck in ISUZU's N-Series. Below are the official body prices:

### NQR81K Model

| Body Description | Price (KES - VAT Inclusive) |
|-----------------|----------------------------|
| NQR-K FULLY ENCLOSED STEEL BODY(CORRUG/PLAIN) | 449,000.00 |
| NQR-K FIXED HIGH SIDED STEEL BODY(CORRUG/PLAIN) | 407,000.00 |
| NQR-K DOUBLE DROPSIDE STEEL BODY(CORRUG/PLAIN) | 406,000.00 |
| NQR-K LOW DROPSIDE STEEL BODY(CORRUG/PLAIN) | 306,000.00 |
| NQR-K TIPPER | 1,485,000.00 |
| NQR81K WATER TANKER 5,000L (Mild Steel) | 1,152,000.00 |
| NQR81K WATER TANKER 5,000L (Stainless Steel) | 1,589,000.00 |
| NQR81K MILK TANKER 5,0000L (Stainless Steel) | 1,591,000.00 |
| NQR81K FUEL TANKER 5,000L (Mild Steel) | 1,413,000.00 |

### NQR81M Model

| Body Description | Price (KES - VAT Inclusive) |
|-----------------|----------------------------|
| NQR81M FULLY ENCLOSED STEEL BODY(CORRUG/PLAIN) | 538,000.00 |
| NQR81M FIXED HIGH SIDED STEEL BODY(CORRUG/PLAIN) | 516,000.00 |
| NQR81M DOUBLE DROPSIDE STEEL BODY(CORRUG/PLAIN) | 526,000.00 |
| NQR81M LOW DROPSIDE STEEL BODY(CORRUG/PLAIN) | 425,000.00 |
| NQR81M FUEL TANKER 6,000L (Mild Steel) | 1,558,000.00 |
| NQR81M MILK TANKER 6,000L (Stainless Steel) | 1,761,000.00 |
| NQR81M WATER TANKER 6,000L (Mild Steel) | 1,209,000.00 |
| NQR81M WATER TANKER 6,000L (Stainless Steel) | 1,636,000.00 |

*Prices are valid for 2022-2023 and are subject to change. Contact your nearest ISUZU dealer for the most current pricing.*

For more information, contact:
ISUZU East Africa
Enterprise/Mombasa Road, Industrial Area
P.O. Box 30527 – 00100, Nairobi, Kenya
Tel: +254 703 013 111
Email: info.kenya@isuzu.co.ke
Website: www.isuzutrucks.co.ke
        `
      }

      if (queryLower.includes("nps") || queryLower.includes("nps81uh")) {
        return `
## ISUZU NPS81UH Truck Body Pricing (2022-2023)

The NPS81UH is a specialized 4x4 truck in ISUZU's N-Series, designed for off-road applications. Below are the official body prices:

| Body Description | Price (KES - VAT Inclusive) |
|-----------------|----------------------------|
| NPS CARGO CARRIER- KDF | 946,000.00 |

*Prices are valid for 2022-2023 and are subject to change. Contact your nearest ISUZU dealer for the most current pricing.*

For more information, contact:
ISUZU East Africa
Enterprise/Mombasa Road, Industrial Area
P.O. Box 30527 – 00100, Nairobi, Kenya
Tel: +254 703 013 111
Email: info.kenya@isuzu.co.ke
Website: www.isuzutrucks.co.ke
        `
      }

      if (queryLower.includes("frr") || queryLower.includes("frr90n")) {
        return `
## ISUZU FRR90N Truck Body Pricing (2022-2023)

The FRR90N is a versatile medium-heavy duty truck in ISUZU's F-Series. Below are the official body prices:

| Body Description | Price (KES - VAT Inclusive) |
|-----------------|----------------------------|
| FRR90N FULLY ENCLOSED STEEL BODY(CORRUG/PLAIN) | 550,000.00 |
| FRR90N FIXED HIGH SIDED STEEL BODY(CORRUG/PLAIN) | 527,000.00 |
| FRR90N DOUBLE DROPSIDE STEEL BODY(CORRUG/PLAIN) | 537,000.00 |
| FRR90N LOW DROPSIDE STEEL BODY(CORRUG/PLAIN) | 422,000.00 |
| FRR90N FUEL TANKER 8,500L (Mild Steel) | 2,042,000.00 |
| FRR90N MILK TANKER 8,500L (Stainless Steel) | 2,398,000.00 |
| FRR90N WATER TANKER 8,500L (Mild Steel) | 1,589,000.00 |
| FRR90N WATER TANKER 8,500L (Stainless Steel) | 2,299,000.00 |

*Prices are valid for 2022-2023 and are subject to change. Contact your nearest ISUZU dealer for the most current pricing.*

For more information, contact:
ISUZU East Africa
Enterprise/Mombasa Road, Industrial Area
P.O. Box 30527 – 00100, Nairobi, Kenya
Tel: +254 703 013 111
Email: info.kenya@isuzu.co.ke
Website: www.isuzutrucks.co.ke
        `
      }

      if (queryLower.includes("fvr") || queryLower.includes("fvr90l") || queryLower.includes("fvr34p")) {
        return `
## ISUZU FVR Truck Body Pricing (2022-2023)

The FVR is a heavy-duty truck in ISUZU's F-Series. Below are the official body prices:

### FVR90L Model

| Body Description | Price (KES - VAT Inclusive) |
|-----------------|----------------------------|
| FVR90L FULLY ENCLOSED STEEL BODY(CORRUG/PLAIN) | 521,000.00 |
| FVR90L FIXED HIGH SIDED STEEL BODY(CORRUG/PLAIN) | 515,000.00 |
| FVR90L DOUBLE DROPSIDE STEEL BODY(CORRUG/PLAIN) | 527,000.00 |
| FVR90L LOW DROPSIDE STEEL BODY(CORRUG/PLAIN) | 433,000.00 |
| FVR90L DOUBLE DROPSIDE STEEL BODY(SAND HARVESTER) | 580,000.00 |
| FVR90L LOW DROPSIDE STEEL BODY(SAND HARVESTER) | 487,000.00 |
| FVR90L TIPPER | 1,716,000.00 |
| FVR90L FUEL TANKER 11,000L (Mild Steel) | 2,181,000.00 |
| FVR90L MILK TANKER 11,000L (Stainless Steel) | 2,686,000.00 |
| FVR90L WATER TANKER 11,000L (Mild Steel) | 1,843,000.00 |
| FVR90L WATER TANKER 11,0000L (Stainless Steel) | 2,459,000.00 |

### FVR34P Model

| Body Description | Price (KES - VAT Inclusive) |
|-----------------|----------------------------|
| FVR FULLY ENCLOSED STEEL BODY(CORRUG/PLAIN) | 602,000.00 |
| FVR FIXED HIGH SIDED STEEL BODY(CORRUG/PLAIN) | 579,000.00 |
| FVR DOUBLE DROPSIDE STEEL BODY(CORRUG/PLAIN) | 584,000.00 |
| FVR LOW DROPSIDE STEEL BODY(CORRUG/PLAIN) | 487,000.00 |
| FVR DOUBLE DROPSIDE STEEL BODY(SAND HARVESTER) | 674,000.00 |
| FVR LOW DROPSIDE STEEL BODY(SAND HARVESTER) | 542,000.00 |
| FVR TIPPER | 1,869,000.00 |
| FVR34P MILK TANKER 12,000L (Stainless Steel) | 3,053,000.00 |
| FVR34P WATER TANKER 12,000L (Mild Steel) | 1,825,000.00 |
| FVR34P WATER TANKER 12,000L (Stainless Steel) | 2,533,000.00 |
| FVR34P FUEL TANKER 12,000L (Mild Steel) | 2,315,000.00 |

*Prices are valid for 2022-2023 and are subject to change. Contact your nearest ISUZU dealer for the most current pricing.*

For more information, contact:
ISUZU East Africa
Enterprise/Mombasa Road, Industrial Area
P.O. Box 30527 – 00100, Nairobi, Kenya
Tel: +254 703 013 111
Email: info.kenya@isuzu.co.ke
Website: www.isuzutrucks.co.ke
        `
      }

      if (queryLower.includes("fvz") || queryLower.includes("fvz34t")) {
        return `
## ISUZU FVZ34T Truck Body Pricing (2022-2023)

The FVZ34T is a heavy-duty truck in ISUZU's F-Series, designed for demanding applications. Below are the official body prices:

| Body Description | Price (KES - VAT Inclusive) |
|-----------------|----------------------------|
| FVZ FULLY ENCLOSED STEEL BODY(CORRUG/PLAIN) | 714,000.00 |
| FVZ FIXED HIGH SIDED STEEL BODY(CORRUG/PLAIN) | 676,000.00 |
| FVZ DOUBLE DROPSIDE STEEL BODY(CORRUG/PLAIN) | 705,000.00 |
| FVZ LOW DROPSIDE STEEL BODY(CORRUG/PLAIN) | 553,000.00 |
| FVZ DOUBLE DROPSIDE STEEL BODY(SAND HARVESTER) | 749,000.00 |
| FVZ LOW DROPSIDE STEEL BODY(SAND HARVESTER) | 575,000.00 |
| FVZ TIPPER (15CM/12CM) - WITH FRONT TIPPING KIT (Provided by IEA) | 1,353,000.00 |
| FVZ TIPPER (15CM/12CM) - WITH UNDERBODY TIPPING KIT (Provided by IEA) | 1,353,000.00 |
| FVZ34T FUEL TANKER 16,000L (Mild Steel) | 2,346,000.00 |
| FVZ34T MILK TANKER 16,000L (Stainless Steel) | 3,118,000.00 |
| FVZ34T WATER TANKER 16,000L (Mild Steel) | 1,980,000.00 |
| FVZ34T WATER TANKER 16,000L (Stainless Steel) | 3,118,000.00 |

*Prices are valid for 2022-2023 and are subject to change. Contact your nearest ISUZU dealer for the most current pricing.*

For more information, contact:
ISUZU East Africa
Enterprise/Mombasa Road, Industrial Area
P.O. Box 30527 – 00100, Nairobi, Kenya
Tel: +254 703 013 111
Email: info.kenya@isuzu.co.ke
Website: www.isuzutrucks.co.ke
        `
      }

      if (queryLower.includes("fts") || queryLower.includes("fts34l")) {
        return `
## ISUZU FTS34L Truck Body Pricing (2022-2023)

The FTS34L is a specialized heavy-duty truck in ISUZU's F-Series. Below are the official body prices:

| Body Description | Price (KES - VAT Inclusive) |
|-----------------|----------------------------|
| FTS TROOP CARRIER -KDF | 2,111,000.00 |
| FTS TROOP CARRIER-KNPS | 909,000.00 |
| FTS34L WATER TANKER 7,500L (Mild Steel) | 1,428,000.00 |
| FTS34L WATER TANKER 7,500L (Stainless Steel) | 2,315,000.00 |
| FTS34L FUEL TANKER 7,500L (Mild Steel) | 1,709,000.00 |
| FTS34L MILK TANKER 7,500L (Stainless Steel) | 2,090,000.00 |

*Prices are valid for 2022-2023 and are subject to change. Contact your nearest ISUZU dealer for the most current pricing.*

For more information, contact:
ISUZU East Africa
Enterprise/Mombasa Road, Industrial Area
P.O. Box 30527 – 00100, Nairobi, Kenya
Tel: +254 703 013 111
Email: info.kenya@isuzu.co.ke
Website: www.isuzutrucks.co.ke
        `
      }

      if (queryLower.includes("tf") || queryLower.includes("tf-sc")) {
        return `
## ISUZU TF-SC Body Pricing (2022-2023)

The TF-SC is a specialized vehicle in ISUZU's lineup. Below are the official body prices:

| Body Description | Price (KES - VAT Inclusive) |
|-----------------|----------------------------|
| TF NATION BODY | 139,000.00 |
| TF STEEL BODY (CORRUG/PLAIN/WIREMESH) | 139,000.00 |
| TF MATATU BODY | 222,000.00 |

*Prices are valid for 2022-2023 and are subject to change. Contact your nearest ISUZU dealer for the most current pricing.*

For more information, contact:
ISUZU East Africa
Enterprise/Mombasa Road, Industrial Area
P.O. Box 30527 – 00100, Nairobi, Kenya
Tel: +254 703 013 111
Email: info.kenya@isuzu.co.ke
Website: www.isuzutrucks.co.ke
        `
      }

      // If query is about specific body types
      if (queryLower.includes("enclosed") || queryLower.includes("fully enclosed")) {
        return `
## ISUZU Fully Enclosed Steel Body Pricing (2022-2023)

Below are the prices for Fully Enclosed Steel Bodies (Corrugated/Plain) across different ISUZU truck models:

| Model | Price (KES - VAT Inclusive) |
|-------|----------------------------|
| NLR77E | 311,000.00 |
| NMR85H | 378,000.00 |
| NQR81K | 449,000.00 |
| NQR81M | 538,000.00  |
|-------|----------------------------|
| NLR77E | 311,000.00 |
| NMR85H | 378,000.00 |
| NQR81K | 449,000.00 |
| NQR81M | 538,000.00 |
| FRR90N | 550,000.00 |
| FVR90L | 521,000.00 |
| FVR34P | 602,000.00 |
| FVZ34T | 714,000.00 |

*Prices are valid for 2022-2023 and are subject to change. Contact your nearest ISUZU dealer for the most current pricing.*

For more information, contact:
ISUZU East Africa
Enterprise/Mombasa Road, Industrial Area
P.O. Box 30527 – 00100, Nairobi, Kenya
Tel: +254 703 013 111
Email: info.kenya@isuzu.co.ke
Website: www.isuzutrucks.co.ke
        `
      }

      if (queryLower.includes("high sided") || queryLower.includes("fixed high")) {
        return `
## ISUZU Fixed High Sided Steel Body Pricing (2022-2023)

Below are the prices for Fixed High Sided Steel Bodies (Corrugated/Plain) across different ISUZU truck models:

| Model | Price (KES - VAT Inclusive) |
|-------|----------------------------|
| NLR77E | 283,000.00 |
| NMR85H | 355,000.00 |
| NQR81K | 407,000.00 |
| NQR81M | 516,000.00 |
| FRR90N | 527,000.00 |
| FVR90L | 515,000.00 |
| FVR34P | 579,000.00 |
| FVZ34T | 676,000.00 |

*Prices are valid for 2022-2023 and are subject to change. Contact your nearest ISUZU dealer for the most current pricing.*

For more information, contact:
ISUZU East Africa
Enterprise/Mombasa Road, Industrial Area
P.O. Box 30527 – 00100, Nairobi, Kenya
Tel: +254 703 013 111
Email: info.kenya@isuzu.co.ke
Website: www.isuzutrucks.co.ke
        `
      }

      if (queryLower.includes("dropside") || queryLower.includes("double dropside")) {
        return `
## ISUZU Double Dropside Steel Body Pricing (2022-2023)

Below are the prices for Double Dropside Steel Bodies (Corrugated/Plain) across different ISUZU truck models:

| Model | Price (KES - VAT Inclusive) |
|-------|----------------------------|
| NMR85H | 378,000.00 |
| NQR81K | 406,000.00 |
| NQR81M | 526,000.00 |
| FRR90N | 537,000.00 |
| FVR90L | 527,000.00 |
| FVR34P | 584,000.00 |
| FVZ34T | 705,000.00 |

### Sand Harvester Double Dropside Bodies
| Model | Price (KES - VAT Inclusive) |
|-------|----------------------------|
| FVR90L | 580,000.00 |
| FVR34P | 674,000.00 |
| FVZ34T | 749,000.00 |

*Prices are valid for 2022-2023 and are subject to change. Contact your nearest ISUZU dealer for the most current pricing.*

For more information, contact:
ISUZU East Africa
Enterprise/Mombasa Road, Industrial Area
P.O. Box 30527 – 00100, Nairobi, Kenya
Tel: +254 703 013 111
Email: info.kenya@isuzu.co.ke
Website: www.isuzutrucks.co.ke
        `
      }

      if (queryLower.includes("low dropside")) {
        return `
## ISUZU Low Dropside Steel Body Pricing (2022-2023)

Below are the prices for Low Dropside Steel Bodies (Corrugated/Plain) across different ISUZU truck models:

| Model | Price (KES - VAT Inclusive) |
|-------|----------------------------|
| NMR85H | 283,000.00 |
| NQR81K | 306,000.00 |
| NQR81M | 425,000.00 |
| FRR90N | 422,000.00 |
| FVR90L | 433,000.00 |
| FVR34P | 487,000.00 |
| FVZ34T | 553,000.00 |

### Sand Harvester Low Dropside Bodies
| Model | Price (KES - VAT Inclusive) |
|-------|----------------------------|
| FVR90L | 487,000.00 |
| FVR34P | 542,000.00 |
| FVZ34T | 575,000.00 |

*Prices are valid for 2022-2023 and are subject to change. Contact your nearest ISUZU dealer for the most current pricing.*

For more information, contact:
ISUZU East Africa
Enterprise/Mombasa Road, Industrial Area
P.O. Box 30527 – 00100, Nairobi, Kenya
Tel: +254 703 013 111
Email: info.kenya@isuzu.co.ke
Website: www.isuzutrucks.co.ke
        `
      }

      if (queryLower.includes("tipper")) {
        return `
## ISUZU Tipper Body Pricing (2022-2023)

Below are the prices for Tipper Bodies across different ISUZU truck models:

| Model | Description | Price (KES - VAT Inclusive) |
|-------|------------|----------------------------|
| NQR81K | Tipper | 1,485,000.00 |
| FVR90L | Tipper | 1,716,000.00 |
| FVR34P | Tipper | 1,869,000.00 |
| FVZ34T | Tipper (15CM/12CM) - With Front Tipping Kit | 1,353,000.00 |
| FVZ34T | Tipper (15CM/12CM) - With Underbody Tipping Kit | 1,353,000.00 |

*Prices are valid for 2022-2023 and are subject to change. Contact your nearest ISUZU dealer for the most current pricing.*

For more information, contact:
ISUZU East Africa
Enterprise/Mombasa Road, Industrial Area
P.O. Box 30527 – 00100, Nairobi, Kenya
Tel: +254 703 013 111
Email: info.kenya@isuzu.co.ke
Website: www.isuzutrucks.co.ke
        `
      }

      // If query is about tankers specifically
      if (queryLower.includes("tanker") || queryLower.includes("tank")) {
        let tankerType = ""
        if (queryLower.includes("water")) tankerType = "water"
        else if (queryLower.includes("milk")) tankerType = "milk"
        else if (queryLower.includes("fuel")) tankerType = "fuel"

        return `
## ISUZU Tanker Body Pricing (2022-2023)

ISUZU East Africa offers various tanker body options across different truck models. Below are the official prices:

${
  tankerType === "water" || tankerType === ""
    ? `
### Water Tankers
| Model | Capacity | Material | Price (KES - VAT Inclusive) |
|-------|----------|----------|----------------------------|
| NQR81K | 5,000L | Mild Steel | 1,152,000.00 |
| NQR81K | 5,000L | Stainless Steel | 1,589,000.00 |
| NQR81M | 6,000L | Mild Steel | 1,209,000.00 |
| NQR81M | 6,000L | Stainless Steel | 1,636,000.00 |
| FTS34L | 7,500L | Mild Steel | 1,428,000.00 |
| FTS34L | 7,500L | Stainless Steel | 2,315,000.00 |
| FRR90N | 8,500L | Mild Steel | 1,589,000.00 |
| FRR90N | 8,500L | Stainless Steel | 2,299,000.00 |
| FVR90L | 11,000L | Mild Steel | 1,843,000.00 |
| FVR90L | 11,000L | Stainless Steel | 2,459,000.00 |
| FVR34P | 12,000L | Mild Steel | 1,825,000.00 |
| FVR34P | 12,000L | Stainless Steel | 2,533,000.00 |
| FVZ34T | 16,000L | Mild Steel | 1,980,000.00 |
| FVZ34T | 16,000L | Stainless Steel | 3,118,000.00 |
`
    : ""
}

${
  tankerType === "milk" || tankerType === ""
    ? `
### Milk Tankers (All Stainless Steel)
| Model | Capacity | Price (KES - VAT Inclusive) |
|-------|----------|----------------------------|
| NLR77E | 2,500L | 952,000.00 |
| NMR85H | 3,500L | 1,056,000.00 |
| NQR81K | 5,000L | 1,591,000.00 |
| NQR81M | 6,000L | 1,761,000.00 |
| FTS34L | 7,500L | 2,090,000.00 |
| FRR90N | 8,500L | 2,398,000.00 |
| FVR90L | 11,000L | 2,686,000.00 |
| FVR34P | 12,000L | 3,053,000.00 |
| FVZ34T | 16,000L | 3,118,000.00 |
`
    : ""
}

${
  tankerType === "fuel" || tankerType === ""
    ? `
### Fuel Tankers (All Mild Steel)
| Model | Capacity | Price (KES - VAT Inclusive) |
|-------|----------|----------------------------|
| NQR81K | 5,000L | 1,413,000.00 |
| NQR81M | 6,000L | 1,558,000.00 |
| FTS34L | 7,500L | 1,709,000.00 |
| FRR90N | 8,500L | 2,042,000.00 |
| FVR90L | 11,000L | 2,181,000.00 |
| FVR34P | 12,000L | 2,315,000.00 |
| FVZ34T | 16,000L | 2,346,000.00 |
`
    : ""
}

*Prices are valid for 2022-2023 and are subject to change. Contact your nearest ISUZU dealer for the most current pricing.*

For more information, contact:
ISUZU East Africa
Enterprise/Mombasa Road, Industrial Area
P.O. Box 30527 – 00100, Nairobi, Kenya
Tel: +254 703 013 111
Email: info.kenya@isuzu.co.ke
Website: www.isuzutrucks.co.ke
        `
      }

      if (queryLower.includes("troop carrier") || queryLower.includes("kdf") || queryLower.includes("knps")) {
        return `
## ISUZU Troop Carrier Body Pricing (2022-2023)

ISUZU offers specialized Troop Carrier bodies for military and police applications:

| Model | Description | Price (KES - VAT Inclusive) |
|-------|------------|----------------------------|
| FTS34L | FTS TROOP CARRIER -KDF (Kenya Defence Forces) | 2,111,000.00 |
| FTS34L | FTS TROOP CARRIER-KNPS (Kenya National Police Service) | 909,000.00 |
| NPS81UH | NPS CARGO CARRIER- KDF | 946,000.00 |

*Prices are valid for 2022-2023 and are subject to change. Contact your nearest ISUZU dealer for the most current pricing.*

For more information, contact:
ISUZU East Africa
Enterprise/Mombasa Road, Industrial Area
P.O. Box 30527 – 00100, Nairobi, Kenya
Tel: +254 703 013 111
Email: info.kenya@isuzu.co.ke
Website: www.isuzutrucks.co.ke
        `
      }

      if (queryLower.includes("matatu") || queryLower.includes("tf")) {
        return `
## ISUZU TF-SC Matatu Body Pricing (2022-2023)

ISUZU offers specialized bodies for the TF-SC model, popular for public transport (matatu) applications:

| Body Description | Price (KES - VAT Inclusive) |
|-----------------|----------------------------|
| TF NATION BODY | 139,000.00 |
| TF STEEL BODY (CORRUG/PLAIN/WIREMESH) | 139,000.00 |
| TF MATATU BODY | 222,000.00 |

*Prices are valid for 2022-2023 and are subject to change. Contact your nearest ISUZU dealer for the most current pricing.*

For more information, contact:
ISUZU East Africa
Enterprise/Mombasa Road, Industrial Area
P.O. Box 30527 – 00100, Nairobi, Kenya
Tel: +254 703 013 111
Email: info.kenya@isuzu.co.ke
Website: www.isuzutrucks.co.ke
        `
      }

      // General pricing information if no specific model is mentioned
      return `
## ISUZU Truck Body Pricing (2022-2023)

ISUZU East Africa offers a wide range of truck body options across different models. Below is a summary of price ranges for different body types:

### Standard Bodies
- Fully Enclosed Steel Bodies: KES 311,000 - 714,000
- Fixed High Sided Steel Bodies: KES 283,000 - 676,000
- Double Dropside Steel Bodies: KES 378,000 - 705,000
- Low Dropside Steel Bodies: KES 283,000 - 553,000

### Specialized Bodies
- Tippers: KES 1,353,000 - 1,869,000
- Water Tankers (Mild Steel): KES 1,152,000 - 1,980,000
- Water Tankers (Stainless Steel): KES 1,589,000 - 3,118,000
- Milk Tankers (Stainless Steel): KES 952,000 - 3,118,000
- Fuel Tankers (Mild Steel): KES 1,413,000 - 2,346,000

### Special Purpose Bodies
- TF Nation Body: KES 139,000
- TF Steel Body: KES 139,000
- TF Matatu Body: KES 222,000
- Troop Carriers: KES 909,000 - 2,111,000
- Cargo Carriers: KES 946,000

*Prices are valid for 2022-2023, are VAT inclusive, and are subject to change. For specific model pricing, please provide the truck model you're interested in.*

For more information, contact:
ISUZU East Africa
Enterprise/Mombasa Road, Industrial Area
P.O. Box 30527 – 00100, Nairobi, Kenya
Tel: +254 703 013 111
Email: info.kenya@isuzu.co.ke
Website: www.isuzutrucks.co.ke
      `
    }

    // If query is about D-MAX
    if (queryLower.includes("d-max") || queryLower.includes("dmax")) {
      return `
## ISUZU D-MAX
The ISUZU D-MAX is a powerful and reliable pickup truck designed for both work and leisure. 
It features a robust diesel engine, excellent towing capacity, and advanced safety features.

### Key Specifications:
- Engine: 3.0L Turbo Diesel
- Power: 190 HP
- Torque: 450 Nm
- Transmission: 6-speed manual or automatic
- 4WD System: Terrain Command with 2H, 4H and 4L modes
- Towing Capacity: Up to 3.5 tons
- Fuel Efficiency: 7.8L/100km (combined cycle)
      `
    }

    // If query is about MU-X
    if (queryLower.includes("mu-x") || queryLower.includes("mux")) {
      return `
## ISUZU MU-X
The ISUZU MU-X is a versatile 7-seater SUV built on the D-MAX platform. 
It combines rugged off-road capability with family-friendly features and comfort.

### Key Specifications:
- Engine: 3.0L Turbo Diesel
- Power: 190 HP
- Torque: 450 Nm
- Transmission: 6-speed automatic
- Seating: 7 passengers
- 4WD System: Terrain Command
- Fuel Efficiency: 8.1L/100km (combined cycle)
- Safety: 6 airbags, ESC, Traction Control, Hill Start Assist
      `
    }

    // If query is about trucks or N-Series
    if (
      queryLower.includes("truck") ||
      queryLower.includes("n-series") ||
      queryLower.includes("nlr") ||
      queryLower.includes("nmr") ||
      queryLower.includes("nqr") ||
      queryLower.includes("nps")
    ) {
      return `
## ISUZU N-Series Trucks
The ISUZU N-Series is a range of light to medium-duty commercial trucks known for reliability and efficiency.
Popular in East Africa for urban delivery and light commercial applications.

### Models Available:
- NLR77E: Light-duty truck with 2,800kg payload capacity
- NMR85H: Medium-duty truck with 5,500kg payload capacity
- NQR81K: Medium-heavy duty truck with 7,500kg payload capacity
- NQR81M: Medium-heavy duty truck with extended wheelbase
- NPS81UH: 4x4 variant for off-road applications

### Body Options:
ISUZU East Africa offers various body options including:
- Fully Enclosed Steel Bodies
- Fixed High Sided Steel Bodies
- Double Dropside Steel Bodies
- Low Dropside Steel Bodies
- Tippers
- Water Tankers (Mild Steel or Stainless Steel)
- Milk Tankers (Stainless Steel)
- Fuel Tankers (Mild Steel)

For specific pricing information, please inquire about the model and body type you're interested in.
      `
    }

    // If query is about F-Series
    if (
      queryLower.includes("f-series") ||
      queryLower.includes("frr") ||
      queryLower.includes("fvr") ||
      queryLower.includes("fvz") ||
      queryLower.includes("fts")
    ) {
      return `
## ISUZU F-Series Trucks
The ISUZU F-Series is a range of medium to heavy-duty commercial trucks designed for demanding applications.
These trucks are widely used in construction, logistics, and specialized transport in East Africa.

### Models Available:
- FRR90N: Medium-heavy duty truck with 10,400kg payload capacity
- FVR90L: Heavy-duty truck with 12,500kg payload capacity
- FVR34P: Heavy-duty truck with extended wheelbase
- FVZ34T: Heavy-duty truck with 16,000kg payload capacity
- FTS34L: Heavy-duty 4x4 truck for specialized applications

### Body Options:
ISUZU East Africa offers various body options including:
- Fully Enclosed Steel Bodies
- Fixed High Sided Steel Bodies
- Double Dropside Steel Bodies
- Low Dropside Steel Bodies
- Tippers
- Water Tankers (Mild Steel or Stainless Steel)
- Milk Tankers (Stainless Steel)
- Fuel Tankers (Mild Steel)
- Specialized bodies like Troop Carriers

For specific pricing information, please inquire about the model and body type you're interested in.
      `
    }

    // Default response for general queries
    return `
## ISUZU East Africa
ISUZU East Africa (formerly General Motors East Africa) is the leading motor vehicle manufacturer in Eastern Africa, with a market share of over 44% in Kenya.

### Key Products:
- Passenger Vehicles: D-MAX pickup and MU-X SUV
- Commercial Vehicles: N-Series and F-Series trucks
- Buses: Various models for public transport and private use

### Company Information:
- Headquarters: Nairobi, Kenya
- Established: 1975 (as General Motors East Africa)
- Rebranded: 2017 (as ISUZU East Africa)
- Manufacturing Facility: Nairobi, Kenya
- Annual Production: Over 5,000 vehicles
- Market: Kenya and export to neighboring countries

### Contact Information:
ISUZU East Africa
Enterprise/Mombasa Road, Industrial Area
P.O. Box 30527 – 00100, Nairobi, Kenya
Tel: +254 703 013 111
Email: info.kenya@isuzu.co.ke
Website: www.isuzutrucks.co.ke
    `
  } catch (error) {
    console.error("Error fetching ISUZU content:", error)
    return "Unable to fetch information from ISUZU East Africa at this time."
  }
}

