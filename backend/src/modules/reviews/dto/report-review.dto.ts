import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, MinLength } from 'class-validator';

export enum ReportReason {
  SPAM = 'spam',
  OFFENSIVE = 'offensive',
  INAPPROPRIATE = 'inappropriate',
  FAKE = 'fake',
  OTHER = 'other',
}

export class ReportReviewDto {
  @ApiProperty({
    description: 'Reason for reporting',
    enum: ReportReason,
    example: ReportReason.SPAM,
  })
  @IsEnum(ReportReason)
  reason: ReportReason;

  @ApiProperty({
    description: 'Additional details about the report',
    example: 'This review appears to be spam...',
    minLength: 10,
  })
  @IsString()
  @MinLength(10)
  details: string;
}
