import { Injectable, Logger } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitmqService {
  private readonly logger = new Logger(RabbitmqService.name);
  private connection: amqp.Connection;
  private channel: amqp.Channel;

  async connect(): Promise<void> {
    try {
      this.connection = await amqp.connect('amqp://guest:guest@rabbitmq:5672');
      this.channel = await this.connection.createChannel();
      this.logger.log('Connected to RabbitMQ');
    } catch (error) {
      this.logger.error('Failed to connect to RabbitMQ:', error);
      throw error;
    }
  }

  async publishToQueue(queue: string, message: string): Promise<void> {
    try {
      await this.channel.assertQueue(queue, { durable: true });
      this.channel.sendToQueue(queue, Buffer.from(message));
      this.logger.log(`Message sent to queue ${queue}: ${message}`);
    } catch (error) {
      this.logger.error(`Failed to send message to ${queue}:`, error);
    }
  }
}
