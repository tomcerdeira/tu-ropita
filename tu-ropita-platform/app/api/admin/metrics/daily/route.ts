import {withAdminPermissionNoParams} from "@/lib/routes_middlewares";
import {productsInteractionsService} from "@/lib/backend/services/productsInteractions.service";
import {BadRequestException} from "@/lib/backend/exceptions/BadRequestException";
import {parseErrorResponse} from "@/lib/utils";



export const POST = withAdminPermissionNoParams(async(req: Request) => {
    try{
        await productsInteractionsService.syncProductMetricsAggDaily();

        return new Response(JSON.stringify(""), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error: any){
        return parseErrorResponse(error)
    }
});

export const GET = withAdminPermissionNoParams(async (req: Request) => {
    const url = new URL(req.url);
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");
    const productId = url.searchParams.get("productId");
    validateDateParameters(startDate, endDate);

    try {
        let metrics ;

        if(productId){
            metrics = await productsInteractionsService.getProductMetricsBetweenDates(new Date(startDate!), new Date(endDate!),productId);
        }else{
            metrics = await productsInteractionsService.getMetricsBetweenDatesAggDaily(new Date(startDate!), new Date(endDate!));
        }

        return new Response(JSON.stringify(metrics), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
            },
        });
    } catch (error: any) {
        return parseErrorResponse(error);
    }
});

function validateDateParameters(startDateStr: string | null, endDateStr: string | null): void {
    if (!startDateStr || !endDateStr) {
        throw new BadRequestException("Missing startDate or endDate parameters");
    }

    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new BadRequestException("Invalid startDate or endDate format. Must be YYYY-MM-DD");
    }

    if (endDate < startDate) {
        throw new BadRequestException("endDate must be equal to or after startDate");
    }

}