import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('logs')
export class Log {
  find(): any[] | PromiseLike<any[]> {
    throw new Error('Method not implemented.');
  }
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  method: string;

  @Column()
  url: string;

  @Column('json', { nullable: true })
  body: any;

  @Column('json', { nullable: true })
  params: any;

  @Column('json', { nullable: true })
  query: any;

  @CreateDateColumn()
  timestamp: Date;
}
