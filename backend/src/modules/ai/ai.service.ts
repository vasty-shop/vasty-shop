import { Injectable, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../database/database.service';
import {
  AutoFillFromImageDto,
  AutoFillFromTextDto,
  AutoFillFromBarcodeDto,
  GenerateDescriptionDto,
  ImproveDescriptionDto,
  GenerateSeoDto,
  GenerateTagsDto,
  SuggestCategoryDto,
  SuggestPricingDto,
  AnalyzeImageDto,
  TranslateProductDto,
  BulkAutoFillDto,
  ConfigureAIDto,
  AIProvider,
  ImageSource,
} from './dto/ai.dto';

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);
  private openaiApiKey: string;
  private defaultModel = 'gpt-4o';
  private defaultMaxTokens = 2000;
  private defaultTemperature = 0.7;
  private usedatabaseSDK = true; // Use database SDK by default

  constructor(
    private readonly db: DatabaseService,
    private readonly configService: ConfigService,
  ) {
    this.openaiApiKey = this.configService.get<string>('OPENAI_API_KEY') || '';
    // Check if database AI is available
    try {
      const ai = this.db.getAI();
      this.usedatabaseSDK = !!ai;
      this.logger.log(`AI module initialized - Using database SDK: ${this.usedatabaseSDK}`);
    } catch {
      this.usedatabaseSDK = false;
      this.logger.warn('database SDK AI not available, falling back to direct OpenAI');
    }
  }

  // ============================================
  // PRODUCT AUTO-FILL
  // ============================================

  async autoFillFromImage(shopId: string, dto: AutoFillFromImageDto) {
    await this.validateAIConfig();

    let imageData: string;
    if (dto.source === ImageSource.URL && dto.imageUrl) {
      imageData = dto.imageUrl;
    } else if (dto.source === ImageSource.BASE64 && dto.imageBase64) {
      imageData = dto.imageBase64;
    } else {
      throw new BadRequestException('Invalid image source');
    }

    const prompt = this.buildImageAnalysisPrompt(dto.categoryHint, dto.language);

    try {
      const response = await this.callOpenAI({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: {
                  url: dto.source === ImageSource.URL ? imageData : `data:image/jpeg;base64,${imageData}`,
                },
              },
            ],
          },
        ],
        max_tokens: 2000,
      });

      const result = this.parseAIResponse(response);

      // Add SEO if requested
      if (dto.includeSeo && result.name) {
        result.seo = await this.generateSeoInternal(result.name, result.description, dto.language);
      }

      // Add pricing if requested
      if (dto.includePricing && result.name) {
        result.pricing = await this.suggestPricingInternal(result.name, result.category);
      }

      await this.logAIUsage(shopId, 'auto_fill_image', response.usage);

      return { data: result };
    } catch (error) {
      throw new InternalServerErrorException('Failed to analyze image: ' + (error as Error).message);
    }
  }

  async autoFillFromText(shopId: string, dto: AutoFillFromTextDto) {
    await this.validateAIConfig();

    const prompt = `Generate product details for: "${dto.productName}"
${dto.context ? `Additional context: ${dto.context}` : ''}
${dto.categoryHint ? `Category hint: ${dto.categoryHint}` : ''}
${dto.language ? `Language: ${dto.language}` : 'Language: English'}

Return a JSON object with:
{
  "name": "optimized product name",
  "description": "detailed product description (200-300 words)",
  "shortDescription": "brief 1-2 sentence summary",
  "features": ["feature 1", "feature 2", ...] (5-8 key features),
  "category": "suggested category",
  "tags": ["tag1", "tag2", ...] (10-15 relevant tags),
  "confidence": 0.0-1.0 (how confident in the suggestions)
}`;

    try {
      const response = await this.callOpenAI({
        model: this.defaultModel,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: this.defaultMaxTokens,
        temperature: this.defaultTemperature,
      });

      const result = this.parseAIResponse(response);

      if (dto.includeSeo) {
        result.seo = await this.generateSeoInternal(result.name, result.description, dto.language);
      }

      if (dto.includePricing) {
        result.pricing = await this.suggestPricingInternal(result.name, result.category);
      }

      await this.logAIUsage(shopId, 'auto_fill_text', response.usage);

      return { data: result };
    } catch (error) {
      throw new InternalServerErrorException('Failed to generate product details: ' + (error as Error).message);
    }
  }

  async autoFillFromBarcode(shopId: string, dto: AutoFillFromBarcodeDto) {
    await this.validateAIConfig();

    const prompt = `Look up product information for barcode/UPC/EAN: ${dto.barcode}
${dto.language ? `Language: ${dto.language}` : 'Language: English'}

Return a JSON object with all available product information:
{
  "name": "product name",
  "brand": "brand name if known",
  "description": "product description",
  "category": "product category",
  "features": ["feature1", "feature2"],
  "tags": ["tag1", "tag2"],
  "specifications": {"key": "value"},
  "confidence": 0.0-1.0
}

If the barcode is not recognized, return {"error": "Barcode not found", "confidence": 0}`;

    try {
      const response = await this.callOpenAI({
        model: this.defaultModel,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1500,
      });

      const result = this.parseAIResponse(response);

      if (dto.includeSeo && result.name) {
        result.seo = await this.generateSeoInternal(result.name, result.description, dto.language);
      }

      await this.logAIUsage(shopId, 'auto_fill_barcode', response.usage);

      return { data: result };
    } catch (error) {
      throw new InternalServerErrorException('Failed to lookup barcode: ' + (error as Error).message);
    }
  }

  // ============================================
  // DESCRIPTION GENERATION
  // ============================================

  async generateDescription(shopId: string, dto: GenerateDescriptionDto) {
    await this.validateAIConfig();

    const lengthGuide = {
      short: '50-100 words',
      medium: '150-200 words',
      long: '250-350 words',
    };

    const prompt = `Generate a product description for: "${dto.productName}"
Category: ${dto.category || 'General'}
${dto.features?.length ? `Key Features: ${dto.features.join(', ')}` : ''}
${dto.targetAudience ? `Target Audience: ${dto.targetAudience}` : ''}
Length: ${lengthGuide[dto.length as keyof typeof lengthGuide] || lengthGuide.medium}
Tone: ${dto.tone || 'professional'}
Language: ${dto.language || 'English'}
Number of variants: ${dto.variants || 1}

Return a JSON object:
{
  "description": "main product description",
  "variants": ["variant 1", "variant 2", ...],
  "wordCount": number
}`;

    try {
      const response = await this.callOpenAI({
        model: this.defaultModel,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2000,
        temperature: 0.8,
      });

      const result = this.parseAIResponse(response);
      await this.logAIUsage(shopId, 'generate_description', response.usage);

      return { data: result };
    } catch (error) {
      throw new InternalServerErrorException('Failed to generate description: ' + (error as Error).message);
    }
  }

  async improveDescription(shopId: string, dto: ImproveDescriptionDto) {
    await this.validateAIConfig();

    const goals = dto.improvementGoals?.join(', ') || 'clarity, engagement, SEO';

    const prompt = `Improve this product description with focus on: ${goals}
Language: ${dto.language || 'English'}

Current description:
"${dto.currentDescription}"

Return a JSON object:
{
  "improvedDescription": "the improved description",
  "changes": ["change 1", "change 2", ...],
  "improvements": {"clarity": "explanation", "seo": "explanation", ...}
}`;

    try {
      const response = await this.callOpenAI({
        model: this.defaultModel,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1500,
      });

      const result = this.parseAIResponse(response);
      await this.logAIUsage(shopId, 'improve_description', response.usage);

      return { data: result };
    } catch (error) {
      throw new InternalServerErrorException('Failed to improve description: ' + (error as Error).message);
    }
  }

  // ============================================
  // SEO GENERATION
  // ============================================

  async generateSeo(shopId: string, dto: GenerateSeoDto) {
    await this.validateAIConfig();

    const result = await this.generateSeoInternal(
      dto.productName,
      dto.description,
      dto.language,
      dto.category,
      dto.features
    );

    await this.logAIUsage(shopId, 'generate_seo', { total_tokens: 500 });

    return { data: result };
  }

  private async generateSeoInternal(
    productName: string,
    description?: string,
    language?: string,
    category?: string,
    features?: string[]
  ) {
    const prompt = `Generate SEO metadata for this product:
Product: ${productName}
${description ? `Description: ${description.substring(0, 500)}` : ''}
${category ? `Category: ${category}` : ''}
${features?.length ? `Features: ${features.join(', ')}` : ''}
Language: ${language || 'English'}

Return a JSON object:
{
  "metaTitle": "SEO-optimized title (50-60 chars)",
  "metaDescription": "SEO-optimized description (150-160 chars)",
  "slug": "url-friendly-slug",
  "keywords": ["keyword1", "keyword2", ...] (10-15 keywords),
  "ogTitle": "Open Graph title",
  "ogDescription": "Open Graph description"
}`;

    const response = await this.callOpenAI({
      model: this.defaultModel,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 800,
    });

    return this.parseAIResponse(response);
  }

  async generateTags(shopId: string, dto: GenerateTagsDto) {
    await this.validateAIConfig();

    const prompt = `Generate relevant tags for this product:
Product: ${dto.productName}
${dto.description ? `Description: ${dto.description.substring(0, 500)}` : ''}
${dto.category ? `Category: ${dto.category}` : ''}
Max tags: ${dto.maxTags || 10}

Return a JSON object:
{
  "tags": ["tag1", "tag2", ...],
  "categories": ["suggested category 1", "suggested category 2"]
}`;

    try {
      const response = await this.callOpenAI({
        model: this.defaultModel,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
      });

      const result = this.parseAIResponse(response);
      await this.logAIUsage(shopId, 'generate_tags', response.usage);

      return { data: result };
    } catch (error) {
      throw new InternalServerErrorException('Failed to generate tags: ' + (error as Error).message);
    }
  }

  // ============================================
  // CATEGORY SUGGESTION
  // ============================================

  async suggestCategory(shopId: string, dto: SuggestCategoryDto) {
    await this.validateAIConfig();

    const prompt = `Suggest the best category for this product:
Product: ${dto.productName}
${dto.description ? `Description: ${dto.description.substring(0, 500)}` : ''}
${dto.availableCategories?.length ? `Available categories: ${dto.availableCategories.join(', ')}` : ''}

Return a JSON object:
{
  "primaryCategory": "best matching category",
  "secondaryCategories": ["alternative 1", "alternative 2"],
  "confidence": 0.0-1.0,
  "reasoning": "why this category was chosen"
}`;

    try {
      const response = await this.callOpenAI({
        model: this.defaultModel,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
      });

      const result = this.parseAIResponse(response);
      await this.logAIUsage(shopId, 'suggest_category', response.usage);

      return { data: result };
    } catch (error) {
      throw new InternalServerErrorException('Failed to suggest category: ' + (error as Error).message);
    }
  }

  // ============================================
  // PRICING SUGGESTION
  // ============================================

  async suggestPricing(shopId: string, dto: SuggestPricingDto) {
    await this.validateAIConfig();

    const result = await this.suggestPricingInternal(
      dto.productName,
      dto.category,
      dto.brand,
      dto.features,
      dto.region,
      dto.currency
    );

    await this.logAIUsage(shopId, 'suggest_pricing', { total_tokens: 500 });

    return { data: result };
  }

  private async suggestPricingInternal(
    productName: string,
    category?: string,
    brand?: string,
    features?: string[],
    region?: string,
    currency?: string
  ) {
    const prompt = `Suggest pricing for this product:
Product: ${productName}
${category ? `Category: ${category}` : ''}
${brand ? `Brand: ${brand}` : ''}
${features?.length ? `Features: ${features.join(', ')}` : ''}
${region ? `Market Region: ${region}` : 'Market Region: US'}
Currency: ${currency || 'USD'}

Return a JSON object:
{
  "suggestedPrice": number,
  "minPrice": number,
  "maxPrice": number,
  "currency": "${currency || 'USD'}",
  "confidence": "low" | "medium" | "high",
  "reasoning": "explanation of pricing suggestion"
}`;

    const response = await this.callOpenAI({
      model: this.defaultModel,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
    });

    return this.parseAIResponse(response);
  }

  // ============================================
  // IMAGE ANALYSIS
  // ============================================

  async analyzeImage(shopId: string, dto: AnalyzeImageDto) {
    await this.validateAIConfig();

    let imageData: string;
    if (dto.source === ImageSource.URL && dto.imageUrl) {
      imageData = dto.imageUrl;
    } else if (dto.source === ImageSource.BASE64 && dto.imageBase64) {
      imageData = `data:image/jpeg;base64,${dto.imageBase64}`;
    } else {
      throw new BadRequestException('Invalid image source');
    }

    const analysisRequests = [];
    if (dto.extractColors) analysisRequests.push('dominant colors (hex codes and names)');
    if (dto.detectObjects) analysisRequests.push('objects and their confidence scores');
    if (dto.generateAltText) analysisRequests.push('descriptive alt text for accessibility');

    const prompt = `Analyze this image and provide:
${analysisRequests.length ? analysisRequests.join(', ') : 'labels, colors, objects, and alt text'}

Return a JSON object:
{
  "labels": ["label1", "label2", ...],
  "colors": [{"hex": "#...", "name": "color name", "percentage": 0-100}],
  "objects": [{"name": "object", "confidence": 0.0-1.0}],
  "altText": "descriptive alt text",
  "suggestedCategory": "product category based on image"
}`;

    try {
      const response = await this.callOpenAI({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: imageData } },
            ],
          },
        ],
        max_tokens: 1000,
      });

      const result = this.parseAIResponse(response);
      await this.logAIUsage(shopId, 'analyze_image', response.usage);

      return { data: result };
    } catch (error) {
      throw new InternalServerErrorException('Failed to analyze image: ' + (error as Error).message);
    }
  }

  // ============================================
  // TRANSLATION
  // ============================================

  async translateProduct(shopId: string, dto: TranslateProductDto) {
    await this.validateAIConfig();

    const prompt = `Translate this product information from ${dto.sourceLanguage} to ${dto.targetLanguage}:

Product Name: ${dto.productName}
${dto.description ? `Description: ${dto.description}` : ''}
${dto.features?.length ? `Features: ${dto.features.join(', ')}` : ''}

Return a JSON object with translated content:
{
  "name": "translated name",
  "description": "translated description",
  "features": ["translated feature 1", ...],
  ${dto.includeSeo ? '"seo": {"metaTitle": "...", "metaDescription": "...", "keywords": [...]}' : ''}
}`;

    try {
      const response = await this.callOpenAI({
        model: this.defaultModel,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2000,
      });

      const result = this.parseAIResponse(response);
      await this.logAIUsage(shopId, 'translate_product', response.usage);

      return { data: result };
    } catch (error) {
      throw new InternalServerErrorException('Failed to translate product: ' + (error as Error).message);
    }
  }

  // ============================================
  // BULK OPERATIONS
  // ============================================

  async bulkAutoFill(shopId: string, userId: string, dto: BulkAutoFillDto) {
    const results: any[] = [];
    const errors: any[] = [];

    for (const productId of dto.productIds) {
      try {
        // Get product
        const products = await /* TODO: replace client call */ this.db.client.query
          .from('products')
          .select('*')
          .where('id', productId)
          .get();

        if (!products.length) {
          errors.push({ productId, error: 'Product not found' });
          continue;
        }

        const product = products[0];
        const fieldsToGenerate = dto.fields || ['description', 'seo', 'tags'];

        const updates: Record<string, any> = {};

        if (fieldsToGenerate.includes('description') && (!product.description || dto.overwrite)) {
          const descResult = await this.generateDescription(shopId, {
            productName: product.name,
            category: product.category,
            language: dto.language,
          });
          updates.description = descResult.data.description;
        }

        if (fieldsToGenerate.includes('seo') && (!product.meta_title || dto.overwrite)) {
          const seoResult = await this.generateSeo(shopId, {
            productName: product.name,
            description: product.description,
            language: dto.language,
          });
          updates.meta_title = seoResult.data.metaTitle;
          updates.meta_description = seoResult.data.metaDescription;
          updates.slug = seoResult.data.slug;
        }

        if (fieldsToGenerate.includes('tags') && (!product.tags || dto.overwrite)) {
          const tagsResult = await this.generateTags(shopId, {
            productName: product.name,
            description: product.description,
          });
          updates.tags = JSON.stringify(tagsResult.data.tags);
        }

        if (Object.keys(updates).length) {
          await /* TODO: replace client call */ this.db.client.query
            .from('products')
            .where('id', productId)
            .update({ ...updates, updated_at: new Date().toISOString() })
            .execute();

          results.push({ productId, status: 'updated', fields: Object.keys(updates) });
        } else {
          results.push({ productId, status: 'skipped', reason: 'No fields to update' });
        }
      } catch (error) {
        errors.push({ productId, error: (error as Error).message });
      }
    }

    return {
      data: {
        processed: dto.productIds.length,
        successful: results.filter(r => r.status === 'updated').length,
        skipped: results.filter(r => r.status === 'skipped').length,
        failed: errors.length,
        results,
        errors,
      },
    };
  }

  // ============================================
  // CONFIGURATION
  // ============================================

  async configureAI(shopId: string, dto: ConfigureAIDto) {
    // Store encrypted API key
    const config = {
      provider: dto.provider,
      model: dto.model || this.defaultModel,
      maxTokens: dto.maxTokens || this.defaultMaxTokens,
      temperature: dto.temperature || this.defaultTemperature,
    };

    const existing = await /* TODO: replace client call */ this.db.client.query
      .from('ai_configurations')
      .select('id')
      .where('shop_id', shopId)
      .get();

    if (existing.length) {
      await /* TODO: replace client call */ this.db.client.query
        .from('ai_configurations')
        .where('shop_id', shopId)
        .update({
          ...config,
          api_key_encrypted: dto.apiKey, // In production, encrypt this
          updated_at: new Date().toISOString(),
        })
        .execute();
    } else {
      await /* TODO: replace client call */ this.db.client.query
        .from('ai_configurations')
        .insert({
          shop_id: shopId,
          ...config,
          api_key_encrypted: dto.apiKey,
        })
        .execute();
    }

    return {
      message: 'AI configuration saved successfully',
      data: { provider: dto.provider, model: config.model },
    };
  }

  async getAIConfig(shopId: string) {
    const configs = await /* TODO: replace client call */ this.db.client.query
      .from('ai_configurations')
      .select('provider', 'model', 'max_tokens', 'temperature', 'created_at')
      .where('shop_id', shopId)
      .get();

    if (!configs.length) {
      return {
        data: {
          provider: 'openai',
          model: this.defaultModel,
          maxTokens: this.defaultMaxTokens,
          temperature: this.defaultTemperature,
          configured: false,
        },
      };
    }

    return {
      data: {
        provider: configs[0].provider,
        model: configs[0].model,
        maxTokens: configs[0].max_tokens,
        temperature: configs[0].temperature,
        configured: true,
        createdAt: configs[0].created_at,
      },
    };
  }

  // ============================================
  // USAGE STATISTICS
  // ============================================

  async getUsageStats(shopId: string, startDate?: string, endDate?: string) {
    let builder = /* TODO: replace client call */ this.db.client.query
      .from('ai_usage_logs')
      .select('*')
      .where('shop_id', shopId);

    if (startDate) {
      builder = builder.where('created_at', '>=', startDate);
    }

    if (endDate) {
      builder = builder.where('created_at', '<=', endDate);
    }

    const logs = await builder.get();

    const totalRequests = logs.length;
    const totalTokens = logs.reduce((sum: number, l: any) => sum + (l.tokens_used || 0), 0);

    const byType = logs.reduce((acc: Record<string, number>, l: any) => {
      acc[l.request_type] = (acc[l.request_type] || 0) + 1;
      return acc;
    }, {});

    // Rough cost estimate ($0.01 per 1K tokens for GPT-4)
    const costEstimate = (totalTokens / 1000) * 0.01;

    return {
      data: {
        totalRequests,
        totalTokensUsed: totalTokens,
        requestsByType: Object.entries(byType).map(([type, count]) => ({ type, count })),
        costEstimate: Math.round(costEstimate * 100) / 100,
        lastUsed: logs.length ? logs[logs.length - 1].created_at : null,
      },
    };
  }

  // ============================================
  // HELPERS
  // ============================================

  private async validateAIConfig() {
    // If using database, no local API key needed
    if (this.usedatabaseSDK) {
      return;
    }
    if (!this.openaiApiKey) {
      throw new BadRequestException('OpenAI API key not configured. Either configure OPENAI_API_KEY or use database SDK AI.');
    }
  }

  /**
   * Call AI service - uses database SDK if available, falls back to direct OpenAI
   */
  private async callOpenAI(params: any) {
    // Try database first
    if (this.usedatabaseSDK) {
      try {
        // Check if it's an image analysis request (multimodal)
        const hasImage = params.messages?.some((m: any) =>
          Array.isArray(m.content) && m.content.some((c: any) => c.type === 'image_url')
        );

        if (hasImage) {
          // For image analysis, extract the image URL and text prompt
          const userMessage = params.messages.find((m: any) => m.role === 'user');
          if (userMessage && Array.isArray(userMessage.content)) {
            const textContent = userMessage.content.find((c: any) => c.type === 'text');
            const imageContent = userMessage.content.find((c: any) => c.type === 'image_url');

            if (imageContent?.image_url?.url) {
              // Use database's analyzeImage
              const result = await this.db.getAI().analyzeImage(
                imageContent.image_url.url,
                { question: textContent?.text || 'Analyze this image' }
              );
              // Convert to OpenAI-like response format
              return {
                choices: [{ message: { content: JSON.stringify(result) } }],
                usage: { total_tokens: 500, prompt_tokens: 400, completion_tokens: 100 },
              };
            }
          }
        }

        // For text generation, use generateText
        const lastUserMessage = params.messages?.find((m: any) => m.role === 'user');
        const prompt = typeof lastUserMessage?.content === 'string'
          ? lastUserMessage.content
          : lastUserMessage?.content?.[0]?.text || '';

        const result = await this.db.generateText(prompt, {
          systemMessage: params.messages?.find((m: any) => m.role === 'system')?.content,
        });

        // Extract text from result - database returns { text: string; contentId?: string }
        const text = result?.text || (typeof result === 'string' ? result : JSON.stringify(result));

        return {
          choices: [{ message: { content: text } }],
          usage: { total_tokens: 500, prompt_tokens: 300, completion_tokens: 200 },
        };
      } catch (sdkError) {
        this.logger.warn(`database SDK AI call failed, falling back to direct OpenAI: ${(sdkError as Error).message}`);
        // Fall through to direct OpenAI call
      }
    }

    // Fallback to direct OpenAI call
    if (!this.openaiApiKey) {
      throw new BadRequestException('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.openaiApiKey}`,
      },
      body: JSON.stringify({
        model: params.model || this.defaultModel,
        messages: params.messages,
        max_tokens: params.max_tokens || this.defaultMaxTokens,
        temperature: params.temperature || this.defaultTemperature,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'OpenAI API error');
    }

    return response.json();
  }

  private parseAIResponse(response: any) {
    try {
      const content = response.choices[0]?.message?.content || '';

      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return { rawResponse: content };
    } catch (error) {
      return { rawResponse: response.choices[0]?.message?.content || '' };
    }
  }

  private buildImageAnalysisPrompt(categoryHint?: string, language?: string) {
    return `Analyze this product image and extract all relevant information.
${categoryHint ? `Category hint: ${categoryHint}` : ''}
${language ? `Language: ${language}` : 'Language: English'}

Return a JSON object with:
{
  "name": "product name based on image",
  "description": "detailed product description (150-200 words)",
  "shortDescription": "brief 1-2 sentence summary",
  "features": ["feature 1", "feature 2", ...],
  "category": "suggested product category",
  "tags": ["tag1", "tag2", ...],
  "colors": ["detected colors"],
  "materials": ["detected materials if visible"],
  "confidence": 0.0-1.0
}`;
  }

  private async logAIUsage(shopId: string, requestType: string, usage: any) {
    try {
      await /* TODO: replace client call */ this.db.client.query
        .from('ai_usage_logs')
        .insert({
          shop_id: shopId,
          request_type: requestType,
          tokens_used: usage?.total_tokens || 0,
          prompt_tokens: usage?.prompt_tokens || 0,
          completion_tokens: usage?.completion_tokens || 0,
        })
        .execute();
    } catch (error) {
      // Silently fail logging
    }
  }
}
