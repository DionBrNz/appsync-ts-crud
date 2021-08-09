import {Chance} from 'chance'

const chance = new Chance()

export interface IUser{
    email: string
    password: string
}

export function a_random_user() : IUser{
  const firstName = chance.first({ nationality: 'en' })
  const lastName = chance.first({ nationality: 'en' })
  const suffix = chance.string({ length: 4, pool: 'abcdefghijklmnopqrstuvwxyz' })
  const password = chance.string({ length: 8 })
  const email = `dion.net+${firstName}-${lastName}-${suffix}@gmail.com` 

  return{
      email: email,
      password: password
  }
}