import { useState } from 'react'
import axios from 'axios'
import { GetStaticPaths, GetStaticProps } from 'next'
import { stripe } from '@/src/lib/stripe'
import Stripe from 'stripe'
import Image from 'next/image'
import Head from 'next/head'

import {
  ImageContainer,
  ProductContainer,
  ProductDetails,
} from '@/src/styles/pages/product'
interface ProductProps {
  product: {
    id: string
    name: string
    imageUrl: string
    description: string
    price: string
    defaultPriceId: string
  }
}

export default function Product({ product }: ProductProps) {
  const [isCreateCheckoutSession, setIsCreateCheckoutSession] = useState(false)

  async function handleByProduct() {
    try {
      setIsCreateCheckoutSession(true)

      const response = await axios.post('../api/checkout', {
        priceId: product.defaultPriceId,
      })

      const { checkoutUrl } = response.data

      window.location.href = checkoutUrl
    } catch (error) {
      setIsCreateCheckoutSession(false)
      alert('Falha ao redirecionar ao checkout.')
    }
  }

  return (
    <>
      <Head>
        <title>{product.name} | Ignite Shop</title>
      </Head>

      <ProductContainer>
        <ImageContainer>
          <Image src={product.imageUrl} width={520} height={480} alt="" />
        </ImageContainer>

        <ProductDetails>
          <h1>{product.name}</h1>
          <span>{product.price}</span>

          <p>{product.description}</p>

          <button disabled={isCreateCheckoutSession} onClick={handleByProduct}>
            Comprar agora
          </button>
        </ProductDetails>
      </ProductContainer>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [{ params: { id: 'prod_NbJair5eZrk0oY' } }],
    fallback: 'blocking',
  }
}

export const getStaticProps: GetStaticProps<any, { id: string }> = async ({
  params,
}) => {
  const productId = String(params?.id)

  const product = await stripe.products.retrieve(productId, {
    expand: ['default_price'],
  })

  const price = product.default_price as Stripe.Price

  return {
    props: {
      product: {
        id: product.id,
        name: product.name,
        imageUrl: product.images[0],
        description: product.description,
        defaultPriceId: price.id,
        price: new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(price.unit_amount !== null ? price.unit_amount / 100 : 0),
      },
    },
    revalidate: 60 * 60 * 1, // 1 hours
  }
}
