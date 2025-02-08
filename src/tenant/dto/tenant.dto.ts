import {
  IsOptional,
  IsString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsObject,
  MinLength,
  MaxLength,
  Matches,
} from "class-validator";

// Create DTO
export class CreateTenantDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(255)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  @Matches(/^[a-z0-9-]+$/, {
    message:
      "Subdomain can only contain lowercase letters, numbers, and hyphens",
  })
  subdomain: string;

  @IsEmail()
  @IsNotEmpty()
  contactEmail: string;

  @IsOptional()
  @IsEnum(["active", "suspended", "pending"])
  status?: "active" | "suspended" | "pending";

  @IsObject()
  @IsNotEmpty()
  config: {
    theme: string;
    modules: string[];
    customFields?: Record<string, any>;
  };
}

// Update DTO - all fields are optional for updates
export class UpdateTenantDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(255)
  name?: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  @Matches(/^[a-z0-9-]+$/, {
    message:
      "Subdomain can only contain lowercase letters, numbers, and hyphens",
  })
  subdomain?: string;

  @IsEmail()
  @IsOptional()
  contactEmail?: string;

  @IsOptional()
  @IsEnum(["active", "suspended", "pending"])
  status?: "active" | "suspended" | "pending";

  @IsObject()
  @IsOptional()
  config?: {
    theme?: string;
    modules?: string[];
    customFields?: Record<string, any>;
  };
}

// Response DTO
export class TenantResponseDto {
  id: string;
  name: string;
  subdomain: string;
  contactEmail: string;
  status: "active" | "suspended" | "pending";
  config: {
    theme: string;
    modules: string[];
    customFields?: Record<string, any>;
  };
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;

  constructor(partial: Partial<TenantResponseDto>) {
    Object.assign(this, partial);
  }
}

// List Response DTO for pagination
export class TenantListResponseDto {
  items: TenantResponseDto[];
  total: number;
  page: number;
  limit: number;

  constructor(
    items: TenantResponseDto[],
    total: number,
    page: number,
    limit: number,
  ) {
    this.items = items;
    this.total = total;
    this.page = page;
    this.limit = limit;
  }
}

// Query DTO for filtering and pagination
export class TenantQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(["active", "suspended", "pending"])
  status?: "active" | "suspended" | "pending";

  @IsOptional()
  @MinLength(1)
  @MaxLength(100)
  page?: number = 1;

  @IsOptional()
  @MinLength(1)
  @MaxLength(100)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  sortBy?: string = "createdAt";

  @IsOptional()
  @IsEnum(["ASC", "DESC"])
  sortOrder?: "ASC" | "DESC" = "DESC";
}
