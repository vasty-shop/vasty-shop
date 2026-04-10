import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles, UserRole } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import {
  StartConversationDto,
  SendMessageDto,
  QueryConversationsDto,
  QueryMessagesDto,
  UpdateConversationDto,
  PredefinedMessageDto,
  ChatSettingsDto,
  ConversationType,
} from './dto/chat.dto';

@ApiTags('chat')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // ============================================
  // CONVERSATIONS
  // ============================================

  @Post('conversations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Start a new conversation' })
  @ApiResponse({ status: 201, description: 'Conversation started' })
  async startConversation(@Body() dto: StartConversationDto, @Request() req) {
    const userId = req.user.sub || req.user.userId;
    return this.chatService.startConversation(dto, userId);
  }

  @Get('conversations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get my conversations' })
  @ApiResponse({ status: 200, description: 'List of conversations' })
  async getConversations(@Request() req, @Query() query: QueryConversationsDto) {
    const userId = req.user.sub || req.user.userId;
    return this.chatService.getConversations(userId, query);
  }

  @Get('conversations/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get conversation by ID' })
  @ApiResponse({ status: 200, description: 'Conversation details' })
  async getConversation(@Param('id') id: string, @Request() req) {
    const userId = req.user.sub || req.user.userId;
    return this.chatService.getConversation(id, userId);
  }

  @Patch('conversations/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update conversation' })
  @ApiResponse({ status: 200, description: 'Conversation updated' })
  async updateConversation(
    @Param('id') id: string,
    @Body() dto: UpdateConversationDto,
    @Request() req,
  ) {
    const userId = req.user.sub || req.user.userId;
    return this.chatService.updateConversation(id, dto, userId);
  }

  @Post('conversations/:id/close')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Close conversation' })
  @ApiResponse({ status: 200, description: 'Conversation closed' })
  async closeConversation(@Param('id') id: string, @Request() req) {
    const userId = req.user.sub || req.user.userId;
    return this.chatService.closeConversation(id, userId);
  }

  @Post('conversations/:id/archive')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Archive conversation' })
  @ApiResponse({ status: 200, description: 'Conversation archived' })
  async archiveConversation(@Param('id') id: string, @Request() req) {
    const userId = req.user.sub || req.user.userId;
    return this.chatService.archiveConversation(id, userId);
  }

  // ============================================
  // MESSAGES
  // ============================================

  @Post('messages')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Send a message' })
  @ApiResponse({ status: 201, description: 'Message sent' })
  async sendMessage(@Body() dto: SendMessageDto, @Request() req) {
    const userId = req.user.sub || req.user.userId;
    return this.chatService.sendMessage(dto, userId);
  }

  @Get('conversations/:id/messages')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get messages for a conversation' })
  @ApiResponse({ status: 200, description: 'List of messages' })
  async getMessages(
    @Param('id') id: string,
    @Query() query: QueryMessagesDto,
    @Request() req,
  ) {
    const userId = req.user.sub || req.user.userId;
    return this.chatService.getMessages(id, userId, query);
  }

  @Post('conversations/:id/read')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Mark messages as read' })
  @ApiResponse({ status: 200, description: 'Messages marked as read' })
  async markAsRead(@Param('id') id: string, @Request() req) {
    const userId = req.user.sub || req.user.userId;
    return this.chatService.markAsRead(id, userId);
  }

  @Delete('messages/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a message' })
  @ApiResponse({ status: 200, description: 'Message deleted' })
  async deleteMessage(@Param('id') id: string, @Request() req) {
    const userId = req.user.sub || req.user.userId;
    return this.chatService.deleteMessage(id, userId);
  }

  // ============================================
  // PREDEFINED MESSAGES
  // ============================================

  @Get('predefined-messages')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get predefined messages' })
  @ApiQuery({ name: 'type', required: false, enum: ConversationType })
  @ApiResponse({ status: 200, description: 'List of predefined messages' })
  async getPredefinedMessages(@Query('type') type?: ConversationType) {
    return this.chatService.getPredefinedMessages(type);
  }

  @Post('predefined-messages')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create predefined message (admin)' })
  @ApiResponse({ status: 201, description: 'Predefined message created' })
  async createPredefinedMessage(@Body() dto: PredefinedMessageDto) {
    return this.chatService.createPredefinedMessage(dto);
  }

  @Put('predefined-messages/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update predefined message (admin)' })
  @ApiResponse({ status: 200, description: 'Predefined message updated' })
  async updatePredefinedMessage(
    @Param('id') id: string,
    @Body() dto: Partial<PredefinedMessageDto>,
  ) {
    return this.chatService.updatePredefinedMessage(id, dto);
  }

  @Delete('predefined-messages/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete predefined message (admin)' })
  @ApiResponse({ status: 200, description: 'Predefined message deleted' })
  async deletePredefinedMessage(@Param('id') id: string) {
    return this.chatService.deletePredefinedMessage(id);
  }

  // ============================================
  // SETTINGS & STATS
  // ============================================

  @Get('settings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get chat settings (admin)' })
  @ApiResponse({ status: 200, description: 'Chat settings' })
  async getSettings() {
    return this.chatService.getSettings();
  }

  @Put('settings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update chat settings (admin)' })
  @ApiResponse({ status: 200, description: 'Settings updated' })
  async updateSettings(@Body() dto: ChatSettingsDto) {
    return this.chatService.updateSettings(dto);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get chat statistics (admin)' })
  @ApiQuery({ name: 'period', required: false, enum: ['today', 'week', 'month'] })
  @ApiResponse({ status: 200, description: 'Chat statistics' })
  async getStats(@Query('period') period?: string) {
    return this.chatService.getStats(period);
  }
}
