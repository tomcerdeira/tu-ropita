import { Pool } from "pg";
import pool from "../conf/db.connections";
import { IPromotion } from "../models/interfaces/IPromotion";

class PromotionRepository {

    private db: Pool;

    constructor(db: Pool ) {
        this.db = db;
    }

    async createPromotion(promotion: IPromotion): Promise<IPromotion> {
        if(!promotion.keywords){
            promotion.keywords = [];
        }
        const query_result = await this.db.query('INSERT INTO promotions (product_id, keywords, credits_allocated, show_on_landing) VALUES ($1, $2, $3, $4) RETURNING *', [promotion.product_id, promotion.keywords, promotion.credits_allocated, promotion.show_on_landing]);
        if (query_result.rowCount === 0) {
            throw new Error('Failed to create promotion');
        }
        return query_result.rows[0] as IPromotion;
    }

    async getPromotionsByBrandId(brandId: number): Promise<IPromotion[]> {
        const query_result = await this.db.query('SELECT * FROM promotions WHERE brand_id = $1', [brandId]);
        if (query_result.rowCount === 0) {
            return [];
        }
        return query_result.rows as IPromotion[];
    }

    async getActivePromotions(forLandingPage: boolean = false): Promise<IPromotion[]> {
        let query = 'SELECT * FROM promotions WHERE is_active = true';
        if(forLandingPage){
            query += ' AND show_on_landing = true';
        }
        const query_result = await this.db.query(query);
        if (query_result.rowCount === 0) {
            return [];
        }
        return query_result.rows as IPromotion[];
    }

    async hasPromotionForProduct(productId: number): Promise<boolean> {
        const query_result = await this.db.query('SELECT * FROM promotions WHERE product_id = $1', [productId]);
        if(query_result.rowCount === 0){
            return false;
        }
        return true;
    }

}

export const promotionRepository = new PromotionRepository(pool);  