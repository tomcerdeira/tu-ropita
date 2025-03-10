import { IBrandDto } from "@/lib/backend/dtos/brand.dto.interface";
import { IProductDTO } from "@/lib/backend/dtos/product.dto.interface";
import Bluebird from "bluebird";
import { type ClassValue, clsx } from "clsx";
import Crypto from "crypto";
import { twMerge } from "tailwind-merge";
import { IBrandCreditsDto } from "@/lib/backend/dtos/credit.dto.interface";
import { IPromotionDto } from "./backend/dtos/promotion.dto.interface";
import { CreateUserDto } from "./backend/dtos/user.dto.interface";
import { BadRequestException } from "./backend/exceptions/BadRequestException";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const pbkdf2 = Bluebird.promisify(Crypto.pbkdf2);

const ITERATIONS: number = 1000;
const KEY_LENGTH: number = 32;
const HASH_FUNCTION: string = 'sha512';

export interface HashedPasswordData {
    random_salt: string;
    hashed_password: string;
}

export const hashPassword = async (password: string) => {
    let salt = Crypto.randomBytes(128).toString('base64');
    return { random_salt: salt, hashed_password: await (await pbkdf2(password, salt, ITERATIONS, KEY_LENGTH, HASH_FUNCTION)).toString('base64') } as HashedPasswordData;
}

export const validatePassword = async (randomSaltSaved: string, stringPlainPassword: string, hashedPassword: string) => {
    const derKey: Buffer = await pbkdf2(stringPlainPassword, randomSaltSaved, ITERATIONS, KEY_LENGTH, HASH_FUNCTION);
    return derKey.toString('base64') === hashedPassword;
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export async function getDtoFromBody<T>(req: Request, requiredFields: (keyof T)[], optionalFields: (keyof T)[] = []): Promise<T> {
  let body: any;
  try {
    body = await req.json();
  } catch (error) {
    throw new BadRequestException('Invalid request body. JSON is expected.');
  }

  if (!body || typeof body !== 'object') {
    throw new BadRequestException('Invalid request body. JSON is expected.');
  }

  const bodyKeys = Object.keys(body);
  const allowedFields = [...requiredFields, ...optionalFields];
  const extraFields = bodyKeys.filter(key => !allowedFields.includes(key as keyof T));
  if (extraFields.length > 0) {
    throw new BadRequestException(`Unexpected fields in request: ${extraFields.join(', ')}`);
  }

  if (requiredFields.every(field => body[field] !== undefined)) {
    return allowedFields.reduce((dto, field) => {
      if (body[field] !== undefined) {
        dto[field] = body[field];
      }
      return dto;
    }, {} as T);
  }

  const missingFields = requiredFields.filter(field => body[field] === undefined);
  throw new BadRequestException(`The following fields are required: ${missingFields.join(', ')}`);
}

export async function getBrandDtoFromBody(req: Request): Promise<IBrandDto> {
  return getDtoFromBody<IBrandDto>(
    req,
    ['name', 'image', 'websiteUrl'],
    ['description']
  );
}

export async function getUserDtoFromBody(req: Request): Promise<CreateUserDto> {
  return getDtoFromBody<CreateUserDto>(req, ['email', 'password', 'full_name']);
}


export async function getProductDtoFromBody(req: Request) : Promise<IProductDTO>{
  return getDtoFromBody<IProductDTO>(req, ['name', 'price', 'description','images', 'url']);
}

export async function getUpdateStatusFromBody(req: Request) : Promise<{ status: string }>{
  return getDtoFromBody<{ status: string }>(req, ['status']);
}

export async function getPromotionDtoFromBody(req: Request) : Promise<IPromotionDto>{
  return getDtoFromBody<IPromotionDto>(req, ['product_id', 'credits_allocated', 'show_on_landing'], ['keywords']);
}

export const getBrandCreditsDtoFromBody = async (req: Request): Promise<IBrandCreditsDto> => {
    const body = await req.json();
    
    // Check for either add_credits or remove_credits
    if (body.add_credits === undefined && body.remove_credits === undefined) {
        throw new Error('The following fields are required: add_credits or remove_credits');
    }
    
    return {
        add_credits: body.add_credits,
        remove_credits: body.remove_credits
    };
};

export function formatDateYYYYMMDD(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function validateDateParameters(startDateStr: string | null, endDateStr: string | null): void {
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
// TODO MOVE TO A MIDDLEWARE
export function parseErrorResponse(error:any): Response {
  const statusCode = error.statusCode ? error.statusCode : 500;
  const message    = error.errorMessage    ? error.errorMessage    : 'Internal Server Error';

  return new Response(JSON.stringify({ error: message }), {
    status: statusCode,
    headers: { 'Content-Type': 'application/json' }
  });
}
