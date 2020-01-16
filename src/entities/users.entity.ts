import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Users {
    @PrimaryGeneratedColumn()
    id: number

    @Column('varchar', { length: 10 })
    username: string

    @Column('varchar', { length: 16 })
    password: string
}