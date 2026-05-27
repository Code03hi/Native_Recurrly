import dayjs from "dayjs";

export const formatCurrency = (value: number,currency: string = "USD") => {
    try {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value)
    } catch (error) {
        console.log(error)
        // const formttedValue = value.toFixed(2);
        return value.toFixed(2)
    }
}

export const formatSubscriptionDateTime = (value?: string):string => {
    if(!value) return "Not provided"
    const parsedDate = dayjs(value)
    return parsedDate.isValid() ? parsedDate.format("MM/DD/YYYY") : "Not provided";
}

export const formatStatusLabel = (value?: string):string => {
    if(!value) return "unknown";
    return value.charAt(0).toUpperCase() + value.slice(1)
}