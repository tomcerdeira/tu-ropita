import { IBrand } from "@/lib/backend/models/interfaces/brand.interface";
import { fetcher } from "@/lib/fetcher/fetchWrapper";
import {IBrandDto} from "@/lib/backend/dtos/brand.dto.interface";

const BRANDS_PATH : string = `/brands`;


class PublicBrandsApiWrapper {

    async getBrandById(id: string): Promise<IBrand | null> {
        const [error, brand] = await fetcher(`${BRANDS_PATH}/${id}`);
        if (error) {
            console.error(`Error fetching brand by id ${id}: ${error}`);
            return null;
        }
        return brand as IBrand;
    }
}

class PrivateBrandsApiWrapper {

    //TODO: implement and try

    async createBrand(auth_token: string, brand: IBrandDto): Promise<IBrand | null> {
        const [error, createdBrand] = await fetcher(`${BRANDS_PATH}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${auth_token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(brand),
        });
        if (error) {
            console.error(`Error creating brand: ${error}`);
            return null;
        }
        return createdBrand as IBrand;
    }

    async updateBrand(auth_token: string, id: string, updated_brand: IBrandDto): Promise<IBrand | null> {
        const [error, updatedBrand] = await fetcher(`${BRANDS_PATH}/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${auth_token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updated_brand),
        });
        if (error) {
            console.error(`Error updating brand ${id}: ${error}`);
            return null;
        }
        return updatedBrand as IBrand;
    }

    async deleteBrand(auth_token: string, id: string): Promise<void> {
        const [error] = await fetcher(`${BRANDS_PATH}/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${auth_token}`,
            },
        });
        if (error) {
            console.error(`Error deleting brand ${id}: ${error}`);
        }
    }

    async listBrands(auth_token: string): Promise<IBrand[]> {
        const [error, brands] = await fetcher(`${BRANDS_PATH}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${auth_token}`,
            },
        });
        if (error) {
            console.error(`Error listing brands: ${error}`);
            return [];
        }
        return brands as IBrand[];
    }

    async changeBrandStatus(auth_token: string, id: string, status: string): Promise<IBrand | null> {
        const [error, updatedBrand] = await fetcher(`${BRANDS_PATH}/${id}/status`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${auth_token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status }),
        });
        if (error) {
            console.error(`Error changing status for brand ${id}: ${error}`);
            return null;
        }
        return updatedBrand as IBrand;
    }
   
}

export const publicBrandsApiWrapper = new PublicBrandsApiWrapper();
export const privateBrandsApiWrapper = new PrivateBrandsApiWrapper();