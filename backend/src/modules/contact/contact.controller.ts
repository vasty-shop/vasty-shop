import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ContactService } from './contact.service';
import { ContactFormDto } from './dto/contact.dto';

@Controller('contact')
export class ContactController {
  private readonly logger = new Logger(ContactController.name);

  constructor(private readonly contactService: ContactService) {}

  /**
   * Submit contact form
   * POST /api/v1/contact
   *
   * This endpoint is PUBLIC - no authentication required
   * Sends email to business and confirmation to user
   */
  @Post()
  @HttpCode(HttpStatus.OK)
  async submitContactForm(@Body() dto: ContactFormDto) {
    this.logger.log(`Contact form submission from: ${dto.email}`);
    return await this.contactService.sendContactEmail(dto);
  }
}
