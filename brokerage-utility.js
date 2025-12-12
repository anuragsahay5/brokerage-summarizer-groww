// 0 -> Intraday
// 1 -> Delivery
// GST -> 18%

const RS_CHARGES = [
    {
        STT: { BUY: 0.0, SELL: 0.025 },
        SDC: { BUY: 0.003, SELL: 0.0 },
        ETC: { BUY: 0.00297, SELL: 0.00297 },
        STC: { BUY: 0.0001, SELL: 0.0001 },
        DPC: { BUY: 0.0, SELL: 0.0 },
        IPFTC: { BUY: 0.0001, SELL: 0.0001 }
    },
    {
        STT: { BUY: 0.1, SELL: 0.1 },
        SDC: { BUY: 0.015, SELL: 0.0 },
        ETC: { BUY: 0.00297, SELL: 0.00297 },
        STC: { BUY: 0.0001, SELL: 0.0001 },
        DPC: { BUY: 0.0, SELL: 20.0 },
        IPFTC: { BUY: 0.0001, SELL: 0.0001 }
    }
];

const GROW_BRKG = {
    MIN_PRICE: 5.0,
    MAX_PRICE: 20.0,
    RATE: 0.1,
};

const GST = 0.18

const GET_BROKERAGE_SUMMARY = (buy_price, sell_price, quantity, delivery) => {
    buy_price = parseFloat(buy_price);
    sell_price = parseFloat(sell_price);
    quantity = parseFloat(quantity);
    delivery = parseInt(delivery);

    const buy_total = parseFloat(buy_price * quantity);
    const sell_total = parseFloat(sell_price * quantity);

    let TOTAl_CHARGES = {
        BUY: { GBKG: 0.0, STT: 0.0, SDC: 0.0, ETC: 0.0, STC: 0.0, IPFTC: 0.0, DPC: 0.0, GST: 0.0 },
        SELL: { GBKG: 0.0, STT: 0.0, SDC: 0.0, ETC: 0.0, STC: 0.0, IPFTC: 0.0, DPC: 0.0, GST: 0.0 }
    };

    TOTAl_CHARGES.BUY.GBKG = parseFloat(Math.max(GROW_BRKG.MIN_PRICE, Math.min(GROW_BRKG.MAX_PRICE, 0.01 * GROW_BRKG.RATE * buy_total)).toFixed(2));
    TOTAl_CHARGES.SELL.GBKG = parseFloat(Math.max(GROW_BRKG.MIN_PRICE, Math.min(GROW_BRKG.MAX_PRICE, 0.01 * GROW_BRKG.RATE * sell_total)).toFixed(2));

    TOTAl_CHARGES.BUY.STT = parseFloat(Math.max(1, 0.01 * RS_CHARGES[delivery].STT.BUY * buy_total).toFixed(0));
    TOTAl_CHARGES.SELL.STT = parseFloat(Math.max(1, 0.01 * RS_CHARGES[delivery].STT.SELL * sell_total).toFixed(0));

    TOTAl_CHARGES.BUY.SDC = parseFloat((0.01 * RS_CHARGES[delivery].SDC.BUY * buy_total).toFixed(0));

    TOTAl_CHARGES.BUY.ETC = parseFloat((0.01 * RS_CHARGES[delivery].ETC.BUY * buy_total).toFixed(2));
    TOTAl_CHARGES.SELL.ETC = parseFloat((0.01 * RS_CHARGES[delivery].ETC.SELL * sell_total).toFixed(2));

    TOTAl_CHARGES.BUY.STC = parseFloat((0.01 * RS_CHARGES[delivery].STC.BUY * buy_total).toFixed(2));
    TOTAl_CHARGES.SELL.STC = parseFloat((0.01 * RS_CHARGES[delivery].STC.SELL * sell_total).toFixed(2));

    TOTAl_CHARGES.BUY.IPFTC = parseFloat((0.01 * RS_CHARGES[delivery].IPFTC.BUY * buy_total).toFixed(2));
    TOTAl_CHARGES.SELL.IPFTC = parseFloat((0.01 * RS_CHARGES[delivery].IPFTC.SELL * sell_total).toFixed(2));

    TOTAl_CHARGES.SELL.DPC = parseFloat(RS_CHARGES[delivery].DPC.SELL);

    TOTAl_CHARGES.BUY.GST = parseFloat((
        (TOTAl_CHARGES.BUY.GBKG +
            TOTAl_CHARGES.BUY.DPC +
            TOTAl_CHARGES.BUY.ETC +
            TOTAl_CHARGES.BUY.IPFTC +
            TOTAl_CHARGES.BUY.STC
        ) * GST
    ).toFixed(2)
    );
    
    TOTAl_CHARGES.SELL.GST = parseFloat((
        (TOTAl_CHARGES.SELL.GBKG +
            TOTAl_CHARGES.SELL.DPC +
            TOTAl_CHARGES.SELL.ETC +
            TOTAl_CHARGES.SELL.IPFTC +
            TOTAl_CHARGES.SELL.STC
        ) *
        GST
    ).toFixed(2)
    );

    return TOTAl_CHARGES;
};


const GET_DETAILED_SUMMARY = (buy_price, sell_price, quantity, delivery) => {
    const BROKERAGE_SUMMARY = GET_BROKERAGE_SUMMARY(buy_price, sell_price, quantity, delivery)
    const DETAILED_SUMMARY = {
        buyPrice: buy_price,
        sellPrice: sell_price,
        totalBuyAmount: buy_price * quantity,
        totalSellAmount: sell_price * quantity,
        turnover: 0.0,
        totalGrowBrokerage: 0.0,
        totalNonGrowBrokerage: 0.0,
        totalBuyBrokerage: 0.0,
        totalSellBrokerage: 0.0,
        totalBrokerage: 0.0,
        netPnL: 0.0,
    }

    DETAILED_SUMMARY["turnover"] = DETAILED_SUMMARY["totalSellAmount"] - DETAILED_SUMMARY["totalBuyAmount"]
    DETAILED_SUMMARY["totalGrowBrokerage"] = BROKERAGE_SUMMARY["BUY"]["GBKG"] + BROKERAGE_SUMMARY["SELL"]["GBKG"]

    for (x in BROKERAGE_SUMMARY["BUY"]) {
        DETAILED_SUMMARY["totalBrokerage"] += BROKERAGE_SUMMARY["BUY"][x]
        DETAILED_SUMMARY["totalBuyBrokerage"] += BROKERAGE_SUMMARY["BUY"][x]
    }
    for (x in BROKERAGE_SUMMARY["SELL"]) {
        DETAILED_SUMMARY["totalBrokerage"] += BROKERAGE_SUMMARY["SELL"][x]
        DETAILED_SUMMARY["totalSellBrokerage"] += BROKERAGE_SUMMARY["SELL"][x]
    }

    DETAILED_SUMMARY["totalNonGrowBrokerage"] = DETAILED_SUMMARY["totalBrokerage"] - DETAILED_SUMMARY["totalGrowBrokerage"]
    DETAILED_SUMMARY["netPnL"] = DETAILED_SUMMARY["turnover"] - DETAILED_SUMMARY["totalBrokerage"]

    return { ...DETAILED_SUMMARY, BROKERAGE_SUMMARY }
}

console.log(GET_DETAILED_SUMMARY(138.5, 140, 100, 1))