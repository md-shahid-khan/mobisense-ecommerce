'use client'

import Banner from "@/components/Banner"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { useEffect } from "react"
import {useDispatch, useSelector} from "react-redux"
import { fetchProducts } from "@/lib/features/product/productSlice"
import {useAuth, useUser} from "@clerk/nextjs";
import {fetchCart, uploadCart} from "@/lib/features/cart/cartSlice";
import {fetchAddress} from "@/lib/features/address/addressSlice";

export default function PublicLayout({ children }) {

    const dispatch = useDispatch()
    const {user} = useUser();
    const {getToken} = useAuth();
    const {cartItems} = useSelector((state) => state.cart)

    useEffect(() => {
        dispatch(fetchProducts({}))
    }, [dispatch])

    useEffect(() => {
       if (user) {
           dispatch(fetchCart({getToken}))
       }
    }, [user])

    useEffect(() => {
        // Only upload if the user is logged in AND cartItems exists
        if (user && Object.keys(cartItems).length >= 0) {
            dispatch(uploadCart({ getToken }))
            dispatch(fetchAddress({ getToken }))
        }
    }, [cartItems, user, dispatch, getToken]) // Added  dependencies



    return (
        <>
            <Banner />
            <Navbar />
            {children}
            <Footer />
        </>
    )
}