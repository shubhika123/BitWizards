"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuthStore } from "../../store/authStore";
import { API_BASE_URL } from "@/lib/apiConfig";
import {
  MapPin,
  Search,
  Heart,
  ShoppingBag,
  Sparkles,
  ChevronRight,
  Check,
  Sliders,
  ShieldCheck,
  Clock,
  Percent,
  ArrowLeft,
  MessageSquare,
  User,
  Send,
  Zap,
  Bookmark,
  Share2,
  Phone,
  MoreVertical,
  CheckCircle,
  Truck,
  TrendingDown,
  Store,
  Star,
  Compass,
  Loader2
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  image: string;
  trustScore: number;
  distance: number;
  deliveryTime: string;
  pickupTime: string;
  boutique: string;
  location: string;
  rating: number;
  onTimeDelivery: number;
  returnRate: number;
  yearsOnMyntra: number;
  description: string;
}

interface Boutique {
  id: string;
  name: string;
  rating: number;
  distance: number;
  speciality: string;
  verified: boolean;
  x: number; // percentage coordinate on mock map
  y: number; // percentage coordinate on mock map
}

const getLocalBazaarData = (city: string) => {
  const normCity = city.trim().toLowerCase();

  if (normCity === "vizag" || normCity === "vijayawada") {
    const generatedBoutiques: Boutique[] = [
      { id: "b_vratam_1", name: "Sri Lakshmi Pooja Stores", rating: 4.8, distance: 1.2, speciality: "Puja Samagri • Sarees • Prasad Decors • Flowers • Decorations & More", verified: true, x: 42, y: 38 },
      { id: "b_vratam_2", name: "Venkateshwara Saree House", rating: 4.7, distance: 2.1, speciality: "Traditional Sarees • Blouses • Readymades • Pattu & Silk Sarees", verified: true, x: 62, y: 32 },
      { id: "b_vratam_3", name: "Pushpa Flowers & Garlands", rating: 4.6, distance: 3.3, speciality: "Fresh Jasmine • Marigold Garlands • Pooja Flowers", verified: true, x: 28, y: 62 }
    ];

    const generatedProducts: Product[] = [
      {
        id: "vratam_prod_1",
        name: "Varalakshmi Puja Kit",
        category: "Puja Essentials",
        price: 799,
        originalPrice: 950,
        image: "https://m.media-amazon.com/images/I/51wMWN91eiL._SX300_SY300_QL70_FMwebp_.jpg",
        trustScore: 99,
        distance: 1.2,
        deliveryTime: "2 hrs delivery",
        pickupTime: "10 mins",
        boutique: "Sri Lakshmi Pooja Stores",
        location: city,
        rating: 4.8,
        onTimeDelivery: 99,
        returnRate: 1,
        yearsOnMyntra: 4,
        description: "Complete Varalakshmi Vratam pooja kits, kalasam set, brass lamps, and decorative accessories."
      },
      {
        id: "vratam_prod_2",
        name: "Traditional Kanchipuram Silk Saree, Off-White with Pink Border, Zari Woven Temple Design",
        category: "Sarees",
        price: 1150,
        originalPrice: 1250,
        image: "https://m.media-amazon.com/images/I/517JAdUb1ML.jpg",
        trustScore: 98,
        distance: 2.1,
        deliveryTime: "Same-Day Delivery",
        pickupTime: "15 mins",
        boutique: "Venkateshwara Saree House",
        location: city,
        rating: 4.7,
        onTimeDelivery: 98,
        returnRate: 2,
        yearsOnMyntra: 5,
        description: "Premium Kanchipuram silk pattu sarees, brocades, and festive designer blouses."
      },
      {
        id: "vratam_prod_3",
        name: "11 Sacred Lakshmi Pooja Samagri Kit",
        category: "Puja Essentials",
        price: 470,
        originalPrice: 900,
        image: "https://m.media-amazon.com/images/I/51rFfzqTQSL._SY300_SX300_QL70_FMwebp_.jpg",
        trustScore: 97,
        distance: 3.3,
        deliveryTime: "Same-Day Delivery",
        pickupTime: "20 mins",
        boutique: "Pushpa Flowers & Garlands",
        location: city,
        rating: 4.6,
        onTimeDelivery: 97,
        returnRate: 1,
        yearsOnMyntra: 2,
        description: "Freshly sourced jasmine string garlands, yellow & orange marigolds, and decorative lotus flowers."
      },
      {
        id: "vratam_prod_4",
        name: "Sampoorn Pooja Samagri Kit",
        category: "Accessories",
        price: 650,
        originalPrice: 1999,
        image: "https://servdharm.com/cdn/shop/files/SampoornPoojaSamagriKit_3_1200x.png?v=1712585276",
        trustScore: 96,
        distance: 2.1,
        deliveryTime: "Same-Day Delivery",
        pickupTime: "15 mins",
        boutique: "Venkateshwara Saree House",
        location: city,
        rating: 4.7,
        onTimeDelivery: 98,
        returnRate: 2,
        yearsOnMyntra: 3,
        description: "Exquisite gold-plated traditional necklace featuring detailed Goddess Lakshmi motifs."
      },
      {
        id: "vratam_prod_5",
        name: "Women's Kanjivaram Soft Saree",
        category: "Sarees",
        price: 1450,
        originalPrice: 2000,
        image: "https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcT2SCEqTP8jto_mGLzWLRCrchWaSGocz0WTqJjXFfIN2VaGCdo44SM5ynFEAj2v3Y6suSwb5GBFzJ0L33fDqvsEgAzAjEun8pzguJny0iyDT6XEf2xLl48Oqw",
        trustScore: 96,
        distance: 2.1,
        deliveryTime: "Same-Day Delivery",
        pickupTime: "15 mins",
        boutique: "Venkateshwara Saree House",
        location: city,
        rating: 4.7,
        onTimeDelivery: 98,
        returnRate: 2,
        yearsOnMyntra: 3,
        description: "Women's Kanjivaram Soft Lichi Silk Saree With Blouse Piece"
      },
      {
        id: "vratam_prod_6",
        name: "Vahan Pooja Kit - Sacred Essentials for Divine Blessings",
        category: "Puja Essentials",
        price: 1450,
        originalPrice: 2000,
        image: "https://www.pujashree.com/cdn/shop/files/ChatGPTImageApr20_2026_09_39_23PM_900x.png?v=1776701406",
        trustScore: 96,
        distance: 2.1,
        deliveryTime: "Same-Day Delivery",
        pickupTime: "15 mins",
        boutique: "Venkateshwara Saree House",
        location: city,
        rating: 4.7,
        onTimeDelivery: 98,
        returnRate: 2,
        yearsOnMyntra: 3,
        description: " Women's Kanjivaram Soft Lichi Silk Saree With Blouse Piece"
      }
    ];

    return { boutiques: generatedBoutiques, products: generatedProducts };
  }

  if (normCity === "amritsar" || normCity === "ludhiana") {
    const generatedBoutiques: Boutique[] = [
      { id: "b_lohri_1", name: "Bittu Lohri Store", rating: 4.8, distance: 1.2, speciality: "Kurta Pajama • Phulkari • Accessories • Jutis & More", verified: true, x: 42, y: 38 },
      { id: "b_lohri_2", name: "Punjab Phulkari House", rating: 4.7, distance: 2.3, speciality: "Phulkari Dupatta • Suits • Stoles • Salwar Kameez", verified: true, x: 62, y: 30 },
      { id: "b_lohri_3", name: "Punjab Jutti House", rating: 4.6, distance: 2.6, speciality: "Handcrafted Juttis • Leather Footwear • Punjabi Mojaris", verified: true, x: 28, y: 62 }
    ];

    const generatedProducts: Product[] = [
      {
        id: "lohri_prod_1",
        name: "Kurta Pajama",
        category: "Men",
        price: 499,
        originalPrice: 799,
        image: "/lohri_kurta_store.png",
        trustScore: 99,
        distance: 1.2,
        deliveryTime: "2 hrs delivery",
        pickupTime: "10 mins",
        boutique: "Bittu Lohri Store",
        location: city,
        rating: 4.8,
        onTimeDelivery: 99,
        returnRate: 1,
        yearsOnMyntra: 4,
        description: "Traditional Punjabi mustard-yellow cotton Kurta Pajama set for Lohri celebrations."
      },
      {
        id: "lohri_prod_2",
        name: "Phulkari Dupatta",
        category: "Phulkari",
        price: 599,
        originalPrice: 899,
        image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&q=80",
        trustScore: 98,
        distance: 2.3,
        deliveryTime: "Same-Day Delivery",
        pickupTime: "15 mins",
        boutique: "Punjab Phulkari House",
        location: city,
        rating: 4.7,
        onTimeDelivery: 98,
        returnRate: 2,
        yearsOnMyntra: 3,
        description: "Handcrafted phulkari embroidered heavy georgette dupatta with golden border detail."
      },
      {
        id: "lohri_prod_3",
        name: "Zari Punjabi Juttis",
        category: "Accessories",
        price: 349,
        originalPrice: 499,
        image: "/lohri_kurta_store.png",
        trustScore: 97,
        distance: 2.6,
        deliveryTime: "Same-Day Delivery",
        pickupTime: "20 mins",
        boutique: "Punjab Jutti House",
        location: city,
        rating: 4.6,
        onTimeDelivery: 97,
        returnRate: 1,
        yearsOnMyntra: 2,
        description: "Handcrafted leather juttis decorated with golden zari embroidery and phulkari threads."
      },
      {
        id: "lohri_prod_4",
        name: "Phulkari Salwar Suit",
        category: "Women",
        price: 899,
        originalPrice: 1299,
        image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&q=80",
        trustScore: 98,
        distance: 2.3,
        deliveryTime: "Same-Day Delivery",
        pickupTime: "15 mins",
        boutique: "Punjab Phulkari House",
        location: city,
        rating: 4.7,
        onTimeDelivery: 98,
        returnRate: 2,
        yearsOnMyntra: 3,
        description: "Bright red Patiala salwar kameez set featuring rich phulkari design."
      },
      {
        id: "lohri_prod_5",
        name: "Kids Kurta Pajama Set",
        category: "Kids",
        price: 399,
        originalPrice: 599,
        image: "/lohri_kurta_store.png",
        trustScore: 98,
        distance: 1.2,
        deliveryTime: "2 hrs delivery",
        pickupTime: "10 mins",
        boutique: "Bittu Lohri Store",
        location: city,
        rating: 4.8,
        onTimeDelivery: 99,
        returnRate: 1,
        yearsOnMyntra: 2,
        description: "Comfortable organic cotton printed festive wear set for boys."
      }
    ];

    return { boutiques: generatedBoutiques, products: generatedProducts };
  }

  if (normCity === "patna") {
    const generatedBoutiques: Boutique[] = [
      { id: "b_chhath_1", name: "Maa Ganga Pooja Bhandar", rating: 4.8, distance: 1.2, speciality: "Puja Samagri • Brass Urns • Diyas • Traditional Wear", verified: true, x: 40, y: 40 },
      { id: "b_chhath_2", name: "Mithila Handlooms & Sarees", rating: 4.7, distance: 1.8, speciality: "Dhakai Jamdani • Bhagalpuri Silk • Sarees", verified: true, x: 60, y: 35 },
      { id: "b_chhath_3", name: "Ganga Khadi Bhandar", rating: 4.6, distance: 2.5, speciality: "Khadi Kurtas • Nehru Jackets • Handloom Dhoti", verified: true, x: 30, y: 65 }
    ];

    const generatedProducts: Product[] = [
      {
        id: "chhath_prod_1",
        name: "Santarms Chhath Puja Thali Set",
        category: "Puja Essentials",
        price: 299,
        originalPrice: 450,
        image: "https://m.media-amazon.com/images/I/81yJa1khhDL.jpg",
        trustScore: 99,
        distance: 1.2,
        deliveryTime: "Same-Day Delivery",
        pickupTime: "10 mins",
        boutique: "Maa Ganga Pooja Bhandar",
        location: city,
        rating: 4.8,
        onTimeDelivery: 99,
        returnRate: 1,
        yearsOnMyntra: 4,
        description: "Complete Chhath Puja arghya kits, copper vessels, and ceremonial accessories."
      },
      {
        id: "chhath_prod_2",
        name: "Pujahome Puja Samagri Kit with NavShringaar Saman",
        category: "Puja Essentials",
        price: 1299,
        originalPrice: 1999,
        image: "https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcT3erHaDrSUvG8CuYi0ZtUKdMxNK06_u1rP6wxlJCKbRxx-MUbFVPnJ96E4ZZyzOLBMnPQ_UqkTrnu2TBxqa7OlWtWR47Y_T9nSzsuPXuCUE3szw-LdZpQcD2o",
        trustScore: 98,
        distance: 1.8,
        deliveryTime: "Same-Day Delivery",
        pickupTime: "15 mins",
        boutique: "Mithila Handlooms & Sarees",
        location: city,
        rating: 4.7,
        onTimeDelivery: 98,
        returnRate: 2,
        yearsOnMyntra: 3,
        description: "Pujahome Chhat Puja Samagri Kit with NavShringaar Saman"
      },
      {
        id: "chhath_prod_4",
        name: "Chhath puja Combo Set supli and bahagi chhath puja specel",
        category: "Puja Essentials",
        price: 1299,
        originalPrice: 1999,
        image: "https://m.media-amazon.com/images/I/41g-YA6Q+RL._AC_UF894,1000_QL80_.jpg",
        trustScore: 98,
        distance: 1.8,
        deliveryTime: "Same-Day Delivery",
        pickupTime: "15 mins",
        boutique: "Mithila Handlooms & Sarees",
        location: city,
        rating: 4.7,
        onTimeDelivery: 98,
        returnRate: 2,
        yearsOnMyntra: 3,
        description: "Chhath puja Combo Set supli and bahagi chhath puja specel"
      },
      {
        id: "chhath_prod_5",
        name: "Chhath Poojan Kit with Multi 1 Soop",
        category: "Puja Essentials",
        price: 1299,
        originalPrice: 1999,
        image: "https://m.media-amazon.com/images/I/517iezzxZqL._AC_UF894,1000_QL80_.jpg",
        trustScore: 98,
        distance: 1.8,
        deliveryTime: "Same-Day Delivery",
        pickupTime: "15 mins",
        boutique: "Mithila Handlooms & Sarees",
        location: city,
        rating: 4.7,
        onTimeDelivery: 98,
        returnRate: 2,
        yearsOnMyntra: 3,
        description: "Pujahome Chhat Puja Samagri Kit with NavShringaar Saman"
      },
      {
        id: "chhath_prod_3",
        name: "Handwoven Khadi Dhoti Set",
        category: "Ethnic Wear",
        price: 499,
        originalPrice: 799,
        image: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcSepl-TtGde8b54kf6GdBrFOmWe-gyRvr1jthx7amFruIZgncKVo_jW0pphuP7cL3sGO6wrnJoDFVJ6tswzRrVenFZbb4cRrjeiWLuPc-uSyFKzzpB-qpMA2Q",
        trustScore: 97,
        distance: 2.5,
        deliveryTime: "Same-Day Delivery",
        pickupTime: "20 mins",
        boutique: "Ganga Khadi Bhandar",
        location: city,
        rating: 4.6,
        onTimeDelivery: 97,
        returnRate: 1,
        yearsOnMyntra: 2,
        description: "Pure handspun khadi cotton dhoti and dupatta set for festive arghya rituals."
      },
      {
        id: "chhath_prod_6",
        name: "Handcrafted Bamboo Soop Tray for Pooja & Rituals",
        category: "Accessories",
        price: 499,
        originalPrice: 799,
        image: "https://m.media-amazon.com/images/I/7100fGRg9wL.jpg",
        trustScore: 97,
        distance: 2.5,
        deliveryTime: "Same-Day Delivery",
        pickupTime: "20 mins",
        boutique: "Ganga Khadi Bhandar",
        location: city,
        rating: 4.6,
        onTimeDelivery: 97,
        returnRate: 1,
        yearsOnMyntra: 2,
        description: "Traditional Muram Supa for Chhath Puja, Wedding & Religious Use, Eco-Friendly Cane Offering Tray"
      }

    ];

    return { boutiques: generatedBoutiques, products: generatedProducts };
  }

  if (normCity === "belgaum" || normCity === "mumbai") {
    const generatedBoutiques: Boutique[] = [
      { id: "b_ganesh_1", name: "Shree Ganesh Pooja Bhandar", rating: 4.7, distance: 1.2, speciality: "Puja Samagri • Idols • Decor • More", verified: true, x: 42, y: 38 },
      { id: "b_ganesh_2", name: "Sai Decor & Events", rating: 4.6, distance: 2.1, speciality: "Decorations • Torans • Lights • Backdrops", verified: true, x: 62, y: 32 },
      { id: "b_ganesh_3", name: "Mumbai Mojari House", rating: 4.5, distance: 2.6, speciality: "Handcrafted Juttis • Mojaris • Kolhapuris • Sandals", verified: true, x: 28, y: 62 }
    ];

    const generatedProducts: Product[] = [
      {
        id: "ganesh_prod_1",
        name: "Clay Ganesha Idol",
        category: "Idols",
        price: 399,
        originalPrice: 499,
        image: "/ganesh_category_idols.png",
        trustScore: 98,
        distance: 1.2,
        deliveryTime: "2 hrs delivery",
        pickupTime: "10 mins",
        boutique: "Shree Ganesh Pooja Bhandar",
        location: city,
        rating: 4.7,
        onTimeDelivery: 99,
        returnRate: 1,
        yearsOnMyntra: 4,
        description: "Premium eco-friendly clay Ganesha idol crafted by local artisans."
      },
      {
        id: "ganesh_prod_2",
        name: "Festive Flower Garland & LED Lights",
        category: "Decor",
        price: 149,
        originalPrice: 249,
        image: "/pooja_setup_category.png",
        trustScore: 97,
        distance: 2.1,
        deliveryTime: "Same-Day Delivery",
        pickupTime: "15 mins",
        boutique: "Sai Decor & Events",
        location: city,
        rating: 4.6,
        onTimeDelivery: 98,
        returnRate: 2,
        yearsOnMyntra: 3,
        description: "Traditional marigold garlands, torans, LED lights, and backdrop decoration setups."
      },
      {
        id: "ganesh_prod_3",
        name: "Handcrafted Kolhapuri Chappals",
        category: "Footwear",
        price: 499,
        originalPrice: 799,
        image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=250&q=80",
        trustScore: 96,
        distance: 2.6,
        deliveryTime: "Same-Day Delivery",
        pickupTime: "20 mins",
        boutique: "Mumbai Mojari House",
        location: city,
        rating: 4.5,
        onTimeDelivery: 97,
        returnRate: 1,
        yearsOnMyntra: 2,
        description: "Genuine handcrafted leather Kolhapuri chappals with classic braided detail."
      },
      {
        id: "ganesh_prod_4",
        name: "Pooja Samagri Brass Kit",
        category: "Puja Essentials",
        price: 299,
        originalPrice: 399,
        image: "/ganesh_category_puja.png",
        trustScore: 98,
        distance: 1.2,
        deliveryTime: "2 hrs delivery",
        pickupTime: "10 mins",
        boutique: "Shree Ganesh Pooja Bhandar",
        location: city,
        rating: 4.7,
        onTimeDelivery: 99,
        returnRate: 1,
        yearsOnMyntra: 3,
        description: "High quality brass pooja plate, thali accessories, incense holder, and camphor burner."
      },
      {
        id: "ganesh_prod_5",
        name: "Kundan Pooja Thali Set",
        category: "Gifts",
        price: 199,
        originalPrice: 299,
        image: "/pooja_essentials_category.png",
        trustScore: 97,
        distance: 1.2,
        deliveryTime: "2 hrs delivery",
        pickupTime: "10 mins",
        boutique: "Shree Ganesh Pooja Bhandar",
        location: city,
        rating: 4.7,
        onTimeDelivery: 99,
        returnRate: 1,
        yearsOnMyntra: 2,
        description: "Beaded Kundan decorative thali set perfect for festive gifts and celebration ceremonies."
      }
    ];

    return { boutiques: generatedBoutiques, products: generatedProducts };
  }

  if (normCity === "kolkata") {
    const generatedBoutiques: Boutique[] = [
      { id: "b_durga_1", name: "Kumartuli Puja Market", rating: 4.8, distance: 1.3, speciality: "Eco-friendly Clay Idols • Pujo Thali • Dhunuchi Set • Lights", verified: true, x: 42, y: 38 },
      { id: "b_durga_2", name: "Kalighat Handlooms", rating: 4.7, distance: 2.2, speciality: "Lal Paar Sarees • Dhakai Jamdanis • Baluchari Silk • Kurta", verified: true, x: 62, y: 32 },
      { id: "b_durga_3", name: "Nababarsha Gifts & Decor", rating: 4.6, distance: 3.5, speciality: "Festive Shola Flowers • Conch Shells • Gifts • Garlands", verified: true, x: 28, y: 62 }
    ];

    const generatedProducts: Product[] = [
      {
        id: "durga_prod_1",
        name: "Kumartuli Clay Durga Idol",
        category: "Idols",
        price: 1499,
        originalPrice: 1999,
        image: "/ganesh_category_idols.png",
        trustScore: 99,
        distance: 1.3,
        deliveryTime: "Same-Day Delivery",
        pickupTime: "10 mins",
        boutique: "Kumartuli Puja Market",
        location: city,
        rating: 4.8,
        onTimeDelivery: 99,
        returnRate: 1,
        yearsOnMyntra: 4,
        description: "Beautifully hand-sculpted eco-friendly traditional Durga idol by Kumartuli artisans."
      },
      {
        id: "durga_prod_2",
        name: "Lal Paar Cotton Saree",
        category: "Sarees",
        price: 1299,
        originalPrice: 1899,
        image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&q=80",
        trustScore: 98,
        distance: 2.2,
        deliveryTime: "Same-Day Delivery",
        pickupTime: "15 mins",
        boutique: "Kalighat Handlooms",
        location: city,
        rating: 4.7,
        onTimeDelivery: 98,
        returnRate: 2,
        yearsOnMyntra: 3,
        description: "Traditional Bengali red-bordered white cotton saree (Lal Paar) perfect for Ashtami anjali."
      },
      {
        id: "durga_prod_3",
        name: "Dhunuchi & Dhup Kit",
        category: "Puja Essentials",
        price: 349,
        originalPrice: 499,
        image: "/pooja_setup_category.png",
        trustScore: 97,
        distance: 1.3,
        deliveryTime: "Same-Day Delivery",
        pickupTime: "20 mins",
        boutique: "Kumartuli Puja Market",
        location: city,
        rating: 4.8,
        onTimeDelivery: 97,
        returnRate: 1,
        yearsOnMyntra: 2,
        description: "Clay dhunuchi burner, natural dhuno resin, coconut husk, and incense for dhunuchi naach."
      },
      {
        id: "durga_prod_4",
        name: "Festive Shola Decor Set",
        category: "Decor",
        price: 249,
        originalPrice: 399,
        image: "/pooja_setup_category.png",
        trustScore: 96,
        distance: 3.5,
        deliveryTime: "Same-Day Delivery",
        pickupTime: "15 mins",
        boutique: "Nababarsha Gifts & Decor",
        location: city,
        rating: 4.6,
        onTimeDelivery: 96,
        returnRate: 2,
        yearsOnMyntra: 3,
        description: "Exquisite hand-carved white Sholapith floral wall hangings and door torans."
      },
      {
        id: "durga_prod_5",
        name: "Brass Pujo Thali Set",
        category: "Puja Essentials",
        price: 799,
        originalPrice: 1199,
        image: "/ganesh_category_puja.png",
        trustScore: 98,
        distance: 1.3,
        deliveryTime: "Same-Day Delivery",
        pickupTime: "10 mins",
        boutique: "Kumartuli Puja Market",
        location: city,
        rating: 4.8,
        onTimeDelivery: 99,
        returnRate: 1,
        yearsOnMyntra: 4,
        description: "Engraved pure brass thali, incense stand, diya, and prasad bowls for rituals."
      },
      {
        id: "durga_prod_6",
        name: "Bengali Silk Kurta Set",
        category: "Gifts",
        price: 999,
        originalPrice: 1499,
        image: "/lohri_kurta_store.png",
        trustScore: 97,
        distance: 2.2,
        deliveryTime: "Same-Day Delivery",
        pickupTime: "15 mins",
        boutique: "Kalighat Handlooms",
        location: city,
        rating: 4.7,
        onTimeDelivery: 98,
        returnRate: 2,
        yearsOnMyntra: 3,
        description: "Premium Tussar silk kurta pajama set for men for festive pujo look."
      }
    ];

    return { boutiques: generatedBoutiques, products: generatedProducts };
  }

  let theme = {
    speciality: "Premium Fusion & Festive Silk",
    clothing: ["Banarasi Silk Katan Kurta", "Chikankari Georgette Anarkali Saree", "Modern Silk Fusion Sherwani"],
    accessories: ["Designer Zardozi Potli Bag", "Polki Kundan Choker Necklace", "Handcrafted Silk Juttis"],
    boutiques: ["Bengaluru Silk Boutique", "Delhi Connaught Attires", "Metro Fusion Weaves"]
  };

  if (normCity === "patna") {
    theme = {
      speciality: "Chhath Puja Handloom",
      clothing: ["Madhubani Painted Tussar Saree", "Handwoven Bhagalpuri Silk Kurta", "Mithila Hand-loomed Kurti"],
      accessories: ["Madhubani Hand-painted Stole", "Bhagalpuri Silk Dupatta", "Traditional Bihar Pooja items"],
      boutiques: ["Mithila Art Attires", "Patliputra Weaves", "Bhagalpur Silk House"]
    };
  } else if (["vizag", "vijayawada", "mysuru"].includes(normCity)) {
    theme = {
      speciality: "Varalakshmi Vratam Silk",
      clothing: ["Varalakshmi Silk Saree", "Kanchipuram Silk Pattu Pavadai", "Pure Silk Brocade Kurta"],
      accessories: ["Antique Gold Lakshmi Necklace", "Pooja Kalasam Decor", "Brass Vratam Thali Set"],
      boutiques: ["Mysore Silk Emporium", "Vizag Royal Pattu", "Vijayawada Handlooms"]
    };
  } else if (["coimbatore", "madurai", "salem"].includes(normCity)) {
    theme = {
      speciality: "Tamil Nadu Aadi Weaves",
      clothing: ["Pure Kanchipuram Silk Saree", "Coimbatore Cotton Saree", "South Indian Festive Veshti Kurta"],
      accessories: ["Gold-plated Temple Haram", "Fresh Jasmine Flower Garland", "Traditional Brass Vilakku Decor"],
      boutiques: ["Kovai Silk House", "Madurai Handlooms", "Aadi Heritage Silks"]
    };
  } else if (["belgaum", "mumbai"].includes(normCity)) {
    theme = {
      speciality: "Ganesh Chaturthi Traditional Silk",
      clothing: ["Pure Silk Paithani Saree", "Ganesh Chaturthi Cotton Kurta", "Traditional Dhoti & Silk Kurta Set"],
      accessories: ["Golden Ganesha Pendant & Mala", "Modak Puja Serving Platter", "Traditional Brass Diya Set"],
      boutiques: normCity === "mumbai"
        ? ["Lalbaug Festival Attires", "Dadar Handloom House", "Mumbai Ganesh Emporium"]
        : ["Karnataka Silk Emporium", "Belgaum Handlooms", "Ganesha Royal Attires"]
    };
  } else if (["amritsar", "ludhiana"].includes(normCity)) {
    theme = {
      speciality: "Lohri Punjabi Phulkari",
      clothing: ["Traditional Phulkari Salwar Suit", "Lohri Festival Punjabi Kurta", "Heavy Embroidered Punjabi Dupatta"],
      accessories: ["Phulkari Juttis & Mojris", "Traditional Punjabi Parandi", "Lohri Sweets & Til Gift Box"],
      boutiques: ["Amritsar Phulkari Palace", "Ludhiana Heritage Weaves", "Punjab Festive Attire"]
    };
  } else if (normCity === "kolkata") {
    theme = {
      speciality: "Durga Puja Lal Paar Saree & Handloom",
      clothing: ["Traditional Lal Paar Saree", "Bengali Dhakai Jamdani Saree", "Kolkata Hand-woven Kurta"],
      accessories: ["Shakha Pola Bangles Set", "Designer Zardozi Potli Bag", "Durga Puja Conch Shell Decor"],
      boutiques: ["Kalighat Weaves", "Howrah Handloom Emporium", "Bengal Royal Heritage"]
    };
  } else if (normCity === "guwahati") {
    theme = {
      speciality: "Rongali Bihu Mekhela Chador",
      clothing: ["Muga Silk Mekhela Chador", "Traditional Bihu Assamese Kurta", "Eri Silk Hand-woven Shawl"],
      accessories: ["Traditional Assamese Gamusa", "Assamese Jaapi Decor Hat", "Bihu Festive Brass Bangles"],
      boutiques: ["Assam Handloom Co-op", "Brahmaputra Heritage", "Pragjyotish Handloom House"]
    };
  }

  // Generate 6 boutiques based on theme
  const generatedBoutiques: Boutique[] = [
    { id: "b_1", name: theme.boutiques[0] || `${city} Weaves`, rating: 4.8, distance: 1.5, speciality: theme.speciality, verified: true, x: 38, y: 35 },
    { id: "b_2", name: theme.boutiques[1] || `${city} Craft House`, rating: 4.6, distance: 2.8, speciality: theme.speciality, verified: true, x: 62, y: 28 },
    { id: "b_3", name: theme.boutiques[2] || `${city} Heritage Emporium`, rating: 4.5, distance: 3.4, speciality: theme.speciality, verified: false, x: 25, y: 65 },
    { id: "b_4", name: "Metro Craft Co.", rating: 4.4, distance: 4.1, speciality: "Festive Generalists", verified: true, x: 45, y: 48 },
    { id: "b_5", name: "Heritage Attire House", rating: 4.7, distance: 4.9, speciality: "Premium Traditional", verified: true, x: 55, y: 60 },
    { id: "b_6", name: "Weaves of India Co.", rating: 4.6, distance: 5.8, speciality: "Handloom Traditional", verified: true, x: 70, y: 55 }
  ];

  // Generate products using clothing & accessories
  const generatedProducts: Product[] = [];
  if (normCity === "coimbatore" || normCity === "madurai" || normCity === "salem") {
    // Return precise mockup products
    generatedProducts.push({
      id: "aadi_silk_1",
      name: "Pure Kanchipuram Silks • Aadi Silks • Sarees",
      category: "Ethnic Wear",
      price: 1200,
      originalPrice: 2000,
      image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&q=80",
      trustScore: 98,
      distance: 1.2,
      deliveryTime: "2 Hours",
      pickupTime: "15 mins",
      boutique: "Kovai Silk House",
      location: city,
      rating: 4.8,
      onTimeDelivery: 99,
      returnRate: 1,
      yearsOnMyntra: 5,
      description: "Exquisite hand-loomed gold border Kanchipuram silk saree celebrating Aadi tradition."
    });
    generatedProducts.push({
      id: "aadi_silk_2",
      name: "Cotton Sarees • Temple Wear • Readymades",
      category: "Ethnic Wear",
      price: 1600,
      originalPrice: 2600,
      image: "https://images.unsplash.com/photo-1583089892943-e02e5b017b6a?auto=format&fit=crop&w=300&q=80",
      trustScore: 97,
      distance: 2.1,
      deliveryTime: "3 Hours",
      pickupTime: "20 mins",
      boutique: "Madurai Handlooms",
      location: city,
      rating: 4.7,
      onTimeDelivery: 98,
      returnRate: 2,
      yearsOnMyntra: 3,
      description: "Lightweight Madurai cotton saree designed with temple border patterns."
    });
    generatedProducts.push({
      id: "aadi_acc_1",
      name: "Pooja Samagri • Vilakku • Brass Items • Flowers",
      category: "Accessories",
      price: 499,
      originalPrice: 799,
      image: "/pooja_essentials_category.png",
      trustScore: 96,
      distance: 2.3,
      deliveryTime: "2 Hours",
      pickupTime: "10 mins",
      boutique: "Sri Lakshmi Pooja Stores",
      location: city,
      rating: 4.6,
      onTimeDelivery: 97,
      returnRate: 1,
      yearsOnMyntra: 4,
      description: "Authentic brass pooja Vilakkus, incense burners, and fresh garlands."
    });
  } else {

    // Add Clothing products
    theme.clothing.forEach((clothingName, index) => {
      generatedProducts.push({
        id: `cloth_${index}`,
        name: clothingName,
        category: "Ethnic Wear",
        price: 1200 + (index * 400),
        originalPrice: 2000 + (index * 600),
        image: index % 2 === 0
          ? "https://images.pexels.com/photos/25328651/pexels-photo-25328651.jpeg"
          : "https://images.pexels.com/photos/36311379/pexels-photo-36311379.jpeg",
        trustScore: 92 + (index * 2),
        distance: 1.2 + (index * 0.9),
        deliveryTime: index % 2 === 0 ? "2 Hours" : "3 Hours",
        pickupTime: "25 mins",
        boutique: generatedBoutiques[index % 3].name,
        location: city,
        rating: 4.6 + (index * 0.1),
        onTimeDelivery: 96 + index,
        returnRate: 4 - index,
        yearsOnMyntra: 2 + index,
        description: `Beautiful hand-crafted ${clothingName} designed for traditional and festive celebrations.`
      });
    });

    // Add Accessories products
    theme.accessories.forEach((accName, index) => {
      generatedProducts.push({
        id: `acc_${index}`,
        name: accName,
        category: "Accessories",
        price: 499 + (index * 200),
        originalPrice: 799 + (index * 300),
        image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=250&q=80",
        trustScore: 94 + index,
        distance: 1.5 + (index * 1.2),
        deliveryTime: "Same Day",
        pickupTime: "15 mins",
        boutique: generatedBoutiques[(index + 1) % 3].name,
        location: city,
        rating: 4.7,
        onTimeDelivery: 98,
        returnRate: 3,
        yearsOnMyntra: 3,
        description: `Elegant traditional ${accName} to pair beautifully with your festive outfits.`
      });
    });

  }

  // Add a default footwear product
  generatedProducts.push({
    id: "footwear_default",
    name: "Handcrafted Leather Juttis",
    category: "Footwear",
    price: 899,
    originalPrice: 1499,
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=250&q=80",
    trustScore: 95,
    distance: 2.2,
    deliveryTime: "Same Day",
    pickupTime: "20 mins",
    boutique: generatedBoutiques[0].name,
    location: city,
    rating: 4.8,
    onTimeDelivery: 99,
    returnRate: 2,
    yearsOnMyntra: 4,
    description: "Extremely comfortable and stylized leather footwear decorated with golden zari work."
  });

  return { boutiques: generatedBoutiques, products: generatedProducts };
};


const getCityState = (city: string) => {
  const norm = city.trim().toLowerCase();
  if (["belgaum", "mysuru"].includes(norm)) return "Karnataka";
  if (["vijayawada", "vizag"].includes(norm)) return "Andhra Pradesh";
  if (norm === "mumbai") return "Maharashtra";
  if (norm === "patna") return "Bihar";
  if (["amritsar", "ludhiana"].includes(norm)) return "Punjab";
  if (norm === "kolkata") return "West Bengal";
  if (norm === "guwahati") return "Assam";
  return "Tamil Nadu";
};


// Dynamic local bazaar color/theme generator based on local festival
// Dynamic local bazaar color/theme generator based on local festival
// Dynamic local bazaar color/theme generator based on local festival
const getFestiveTheme = (festivalName: string) => {
  const norm = festivalName.trim().toLowerCase();
  
  // Base default values
  let name = "General Festive";
  let hexColor = "#ff3f6c"; // default Myntra pink accent
  let bannerTitle = "Explore Local Sellers with ";
  let bannerHighlight = "Trust";
  let bannerDesc = "Handcrafted accessories, direct handlooms, and traditional clothing.";
  let bannerImg = "/aadi_bazaar_banner.png";
  let bannerBtn = "Explore Collections";
  let bannerBadge = "Bazaar Special";
  let bannerTag = "✨ SUPPORT LOCAL ARTISANS";
  let categories: { name: string; img: string | null; value?: string }[] = [
    { name: "All", img: null, value: "All" },
    { name: "Sarees", img: "/ethnic_wear_category.png", value: "Ethnic Wear" },
    { name: "Jewellery", img: "/jewellery_category.png", value: "Jewellery" },
    { name: "Footwear", img: "/traditional_food_category.png", value: "Footwear" },
    { name: "Miscellaneous", img: "/pooja_essentials_category.png", value: "Miscellaneous" }
  ];
  let festiveBanner = "bg-gradient-to-r from-[#ff3f6c] to-[#e0355f] text-white";

  if (norm === "aadi festival") {
    name = "Aadi Festival";
    hexColor = "#2d5a27"; // Dark green theme accent
    bannerTitle = "Happy\nAadi Festival!";
    bannerHighlight = "";
    bannerDesc = "Embrace tradition with Aadi Pooram silks, temple wear & festive cooking essentials.";
    bannerImg = "/aadi_bazaar_banner.png";
    bannerBtn = "Explore Aadi Collection";
    bannerBadge = "Aadi Month Begins Now";
    bannerTag = "🏺 AADI FESTIVAL SPECIAL";
    categories = [
      { name: "Aadi Silks", img: "/ethnic_wear_category.png" },
      { name: "Aadi Essentials", img: "/pooja_essentials_category.png" },
      { name: "Festive Jewellery", img: "/jewellery_category.png" },
      { name: "Home Decor", img: "/pooja_setup_category.png" },
      { name: "Pooja Items", img: "/pooja_essentials_category.png" }
    ];
    festiveBanner = "bg-[#2d5a27]";
  } else if (norm === "chhath puja") {
    name = "Chhath Puja";
    hexColor = "#ea580c";
    bannerTitle = "Happy";
    bannerHighlight = "Chhath Puja";
    bannerDesc = "Celebrate the festival of sun, faith & gratitude. Shop essentials from trusted local sellers.";
    bannerImg = "/chhath_banner_bg.png";
    bannerBtn = "Explore Collection";
    bannerBadge = "Chhath Special";
    bannerTag = "🌅 CHHATH PUJA SPECIAL";
    categories = [
      { name: "Puja Samagri", img: "/ganesh_category_puja.png" },
      { name: "Sarees", img: "/ethnic_wear_category.png" },
      { name: "Accessories", img: "/traditional_food_category.png" },
      { name: "Gifts", img: "/pooja_essentials_category.png" }
    ];
    festiveBanner = "bg-[#2d1a3c]";
  } else if (norm === "varalakshmi vratam") {
    name = "Varalakshmi Vratam";
    hexColor = "#7c3aed";
    bannerTitle = "Happy";
    bannerHighlight = "Varalakshmi Vratam";
    bannerDesc = "Invite prosperity, health and happiness. Shop puja essentials, sarees, flowers & more.";
    bannerImg = "/varalakshmi_banner_bg.png";
    bannerBtn = "Explore Collection";
    bannerBadge = "Varalakshmi Vratam Special";
    bannerTag = "🪷 VARALAKSHMI VRATAM SPECIAL";
    categories = [
      { name: "Puja Samagri", img: "/ganesh_category_puja.png" },
      { name: "Sarees", img: "/ethnic_wear_category.png" },
      { name: "Flowers", img: "/fresh_pooja_flowers.png" },
      { name: "Gifts", img: "/pooja_essentials_category.png" }
    ];
    festiveBanner = "bg-[#3b1154]";
  } else if (norm === "ganesh chaturthi") {
    name = "Ganesh Chaturthi";
    hexColor = "#ea580c";
    bannerTitle = "Happy";
    bannerHighlight = "Ganesh Chaturthi!";
    bannerDesc = "Welcome Bappa with love. Puja essentials, idols, decor, gifts & more from local sellers.";
    bannerImg = "/ganesh_banner_bg.png";
    bannerBtn = "Explore Collection";
    bannerBadge = "Ganpati Bappa Morya!";
    bannerTag = "🌼 GANESH CHATURTHI SPECIAL";
    categories = [
      { name: "Puja Essentials", img: "/ganesh_category_puja.png" },
      { name: "Idols", img: "/ganesh_category_idols.png" },
      { name: "Decorations", img: "/pooja_setup_category.png" },
      { name: "Footwear & Juttis", img: "/traditional_food_category.png" },
      { name: "Gifts & Hampers", img: "/pooja_essentials_category.png" }
    ];
    festiveBanner = "bg-[#ea580c]";
  } else if (norm === "lohri") {
    name = "Lohri";
    hexColor = "#ea580c";
    bannerTitle = "Happy";
    bannerHighlight = "Lohri! 🔥";
    bannerDesc = "Celebrate the harvest with warmth, food, music & joy. Shop from trusted local sellers.";
    bannerImg = "/lohri_banner_bg.png";
    bannerBtn = "Explore Lohri Collection";
    bannerBadge = "Lohri Special";
    bannerTag = "🔥 LOHRI SPECIAL";
    categories = [
      { name: "Attire", img: "/ethnic_wear_category.png" },
      { name: "Footwear", img: "/traditional_food_category.png" },
      { name: "Decor", img: "/pooja_setup_category.png" },
      { name: "Accessories", img: "/pooja_essentials_category.png" },
      { name: "Jewellery", img: "/jewellery_category.png" }
    ];
    festiveBanner = "bg-[#ea580c]";
  } else if (norm === "durga puja") {
    name = "Durga Puja";
    hexColor = "#be123c";
    bannerTitle = "Happy";
    bannerHighlight = "Durga Puja!";
    bannerDesc = "Celebrate the victory of good over evil with devotion, dhunuchi & festive shopping.";
    bannerImg = "/durga_puja_banner_bg.png";
    bannerBtn = "Explore Durga Puja Collection";
    bannerBadge = "Pujo Special";
    bannerTag = "🔱 DURGA PUJA SPECIAL";
    categories = [
      { name: "Pooja Essentials", img: "/ganesh_category_puja.png" },
      { name: "Sarees", img: "/ethnic_wear_category.png" },
      { name: "Dhak & Dhunuchi", img: "/pooja_setup_category.png" },
      { name: "Decor", img: "/pooja_setup_category.png" },
      { name: "Idols", img: "/ganesh_category_idols.png" },
      { name: "Gifts & Hampers", img: "/pooja_essentials_category.png" }
    ];
    festiveBanner = "bg-[#7c1d2e]";
  }

  // Pure neutral UI tokens as per Myntra spec
  return {
    name,
    bgGradient: "from-white to-white", // Entire page is pure white
    headerBg: "bg-white border-b border-gray-100 shadow-none", // Neutral header
    headerText: "text-gray-800",
    locationBg: "bg-[#FAFAFA] border-b border-gray-100 text-gray-650", // Neutral location strip
    cardBg: "bg-white border-[#EFEFEF]", // Product cards use Level 3 subtle border
    textDark: "text-gray-800",
    textMuted: "text-gray-500",
    priceText: "text-gray-900",
    mapBg: "bg-[#F5F5F5]", // Map bg is clean light grey
    mapGrid: "stroke-gray-350",
    riverColor: "#CBD5E1", // Obfuscated map rivers are clean grey
    accentText: `text-[${hexColor}]`,
    badgeBg: `bg-[${hexColor}]`,
    mapCircle: "bg-gray-400/5 border-gray-400/20",
    festiveBanner,
    hexColor,
    bannerTitle,
    bannerHighlight,
    bannerDesc,
    bannerImg,
    bannerBtn,
    bannerBadge,
    bannerTag,
    categories
  };
};

export default function LocalBazaar() {
  const { user } = useAuthStore();
  const [step, setStep] = useState<number>(1); // 1 = Discover, 2 = Profile, 3 = Slider, 4 = Chat, 5 = Fulfillment, 6 = Success
  const [selectedRadius, setSelectedRadius] = useState<number>(5);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeCity, setActiveCity] = useState<string>("Patna");
  const [activeFestivalName, setActiveFestivalName] = useState<string>("");
  const themeColors = getFestiveTheme(activeFestivalName);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [hoveredBoutique, setHoveredBoutique] = useState<string | null>(null);
  const [selectedBoutique, setSelectedBoutique] = useState<string | null>(null);
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [completedRituals, setCompletedRituals] = useState<string[]>([]);

  const citiesList = [
    "Amritsar",
    "Belgaum",
    "Coimbatore",
    "Kolkata",
    "Ludhiana",
    "Madurai",
    "Mumbai",
    "Mysuru",
    "Patna",
    "Salem",
    "Vijayawada",
    "Vizag"
  ];

  // Bargain states
  const [proposedBid, setProposedBid] = useState<number>(1000);
  const [negotiatedPrice, setNegotiatedPrice] = useState<number>(1299);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "shop"; text: string; time: string }>>([]);
  const [chatRound, setChatRound] = useState<number>(1); // max 2 rounds
  const [userChatInput, setUserChatInput] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [fulfillmentMode, setFulfillmentMode] = useState<"delivery" | "pickup">("delivery");

  // Sync city selection with logged-in user or LocalStorage
  const [simulatedDate, setSimulatedDate] = useState<string>("");

  useEffect(() => {
    const checkDate = () => {
      setSimulatedDate(localStorage.getItem("simulated_date") || "");
    };
    checkDate();
    window.addEventListener("storage", checkDate);
    return () => window.removeEventListener("storage", checkDate);
  }, []);

  useEffect(() => {
    const fetchActiveFestival = async () => {
      try {
        const url = `/api/festivals/active?city=${encodeURIComponent(activeCity)}` +
          (simulatedDate ? `&simulated_date=${encodeURIComponent(simulatedDate)}` : "");
        const res = await fetch(url);
        if (!res.ok) throw new Error("HTTP error");
        const data = await res.json();
        const activeFest = data.regional_festival || data.national_festival || "";
        setActiveFestivalName(activeFest);
      } catch (err) {
        console.warn("Failed to fetch active festival from backend:", err);
      }
    };
    fetchActiveFestival();
  }, [activeCity, simulatedDate]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isMusicMuted, setIsMusicMuted] = useState(false);
  const [showMusicTooltip, setShowMusicTooltip] = useState(false);

  const fadeVolume = (targetVolume: number, duration: number = 500) => {
    if (!audioRef.current) return;
    const audio = audioRef.current;
    const startVolume = audio.volume;
    const diff = targetVolume - startVolume;
    const steps = 10;
    const stepTime = duration / steps;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      const nextVolume = startVolume + (diff * (currentStep / steps));
      audio.volume = Math.max(0, Math.min(1, nextVolume));

      if (currentStep >= steps) {
        clearInterval(interval);
        audio.volume = targetVolume;
        if (targetVolume === 0) {
          audio.pause();
          setIsMusicPlaying(false);
        }
      }
    }, stepTime);
  };

  const startMusic = () => {
    if (typeof window === "undefined") return;
    const isVaralakshmi = themeColors.name === "Varalakshmi Vratam";
    const src = isVaralakshmi ? "/varalakshmi_ambience.mp3" : "/chhath_ambience.mp3";
    const mutedKey = isVaralakshmi ? "varalakshmi_music_muted" : "chhath_music_muted";
    const enabledKey = isVaralakshmi ? "varalakshmi_music_enabled" : "chhath_music_enabled";

    // If there is already an audio playing with a different source, clean it up
    if (audioRef.current && audioRef.current.src && !audioRef.current.src.endsWith(src)) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    if (!audioRef.current) {
      const audio = new Audio(src);
      audio.loop = true;
      audio.volume = 0;
      audio.muted = localStorage.getItem(mutedKey) === "true";
      setIsMusicMuted(audio.muted);
      audioRef.current = audio;
    }

    const audio = audioRef.current;
    audio.muted = isMusicMuted;

    audio.play().then(() => {
      setIsMusicPlaying(true);
      localStorage.setItem(enabledKey, "true");
      fadeVolume(isMusicMuted ? 0 : 0.15, 500);
    }).catch(err => {
      console.warn("Audio playback failed:", err);
    });
  };

  const togglePlayPause = () => {
    if (!audioRef.current) {
      startMusic();
      return;
    }

    const isVaralakshmi = themeColors.name === "Varalakshmi Vratam";
    const src = isVaralakshmi ? "/varalakshmi_ambience.mp3" : "/chhath_ambience.mp3";
    const enabledKey = isVaralakshmi ? "varalakshmi_music_enabled" : "chhath_music_enabled";

    if (audioRef.current.src && !audioRef.current.src.endsWith(src)) {
      startMusic();
      return;
    }

    const audio = audioRef.current;
    if (isMusicPlaying) {
      fadeVolume(0, 500);
      localStorage.setItem(enabledKey, "false");
    } else {
      audio.play().then(() => {
        setIsMusicPlaying(true);
        localStorage.setItem(enabledKey, "true");
        fadeVolume(isMusicMuted ? 0 : 0.15, 500);
      });
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const audio = audioRef.current;
    const isVaralakshmi = themeColors.name === "Varalakshmi Vratam";
    const mutedKey = isVaralakshmi ? "varalakshmi_music_muted" : "chhath_music_muted";

    const nextMuted = !isMusicMuted;
    setIsMusicMuted(nextMuted);
    localStorage.setItem(mutedKey, String(nextMuted));

    if (nextMuted) {
      fadeVolume(0, 300);
      setTimeout(() => {
        audio.muted = true;
      }, 300);
    } else {
      audio.muted = false;
      fadeVolume(0.15, 500);
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current && isMusicPlaying) {
        audioRef.current.pause();
      }
    };
  }, [isMusicPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsMusicPlaying(false);
    }
  }, [themeColors.name]);

  useEffect(() => {
    if (user?.city) {
      setActiveCity(user.city);
    } else {
      const savedCity = localStorage.getItem("selectedCity");
      if (savedCity) {
        setActiveCity(savedCity);
      } else {
        setActiveCity("Belgaum");
      }
    }
  }, [user]);

  useEffect(() => {
    setSelectedBoutique(null);
    setActiveCategory("All");
  }, [activeCity]);

  useEffect(() => {
    setSelectedBoutique(null);
  }, [selectedRadius]);

  // Dynamically load local bazaar boutiques and products matching selected city
  const { boutiques, products: allProducts } = getLocalBazaarData(activeCity);

  // Filter products by active city to dynamically derive available categories
  const cityProducts = allProducts.filter(
    p => p.location.toLowerCase() === activeCity.toLowerCase()
  );
  const uniqueCategories = ["All", ...Array.from(new Set(cityProducts.map(p => p.category)))];

  // Set default product on mount
  useEffect(() => {
    const productsInCity = allProducts.filter((product) => {
      const matchesCity = product.location.toLowerCase() === activeCity.toLowerCase();
      const matchesCategory = activeCategory === "All" || product.category === activeCategory;
      return matchesCity && matchesCategory;
    });

    if (productsInCity.length > 0) {
      setSelectedProduct(productsInCity[0]);
    } else {
      const fallbackProduct = allProducts.find((product) => activeCategory === "All" || product.category === activeCategory) || allProducts[0];
      setSelectedProduct(fallbackProduct);
    }
  }, [activeCity, activeCategory]);

  // Filters boutiques & products based on radius, city, boutique, and selected category
  const filteredBoutiques = boutiques.filter(b => b.distance <= selectedRadius);
  const displayedBoutiques = selectedBoutique
    ? filteredBoutiques.filter(b => b.name === selectedBoutique)
    : filteredBoutiques;
  const filteredProducts = allProducts.filter(
    p => p.distance <= selectedRadius &&
      p.location.toLowerCase() === activeCity.toLowerCase() &&
      (activeCategory === "All" || p.category === activeCategory) &&
      (!selectedBoutique || p.boutique.toLowerCase() === selectedBoutique.toLowerCase())
  );

  // Bargain Bid Acceptance Probability Meter
  const getBargainProbability = (bid: number, originalPrice: number) => {
    const ratio = bid / originalPrice;
    if (ratio >= 0.92) return { label: "High Probability", percentage: 95, color: "text-emerald-500", progressBg: "bg-emerald-500", note: "Boutique will likely accept instantly!" };
    if (ratio >= 0.82) return { label: "Moderate / We Can Try", percentage: 65, color: "text-amber-500", progressBg: "bg-amber-500", note: "Fair offer. Be prepared for a minor counter bid." };
    if (ratio >= 0.70) return { label: "Low Probability", percentage: 30, color: "text-rose-500", progressBg: "bg-rose-500", note: "Very low offer. Might get flatly rejected by artisan." };
    return { label: "Unacceptable Bid", percentage: 5, color: "text-red-600", progressBg: "bg-red-600", note: "Boutique will reject this outright. Try a higher offer." };
  };

  const probInfo = selectedProduct ? getBargainProbability(proposedBid, selectedProduct.price) : { label: "", percentage: 0, color: "", progressBg: "", note: "" };

  // Submit Offer (makes real call to backend /api/bazaar/negotiate)
  const handleSubmitOffer = async () => {
    if (!selectedProduct) return;
    setChatRound(1);
    setIsTyping(true);
    setStep(4); // transition to Chat Screen

    // Set initial user message in chat
    setChatMessages([
      { sender: "user", text: `Namaste! Can I purchase this for ₹${proposedBid}?`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ]);
    try {
      const response = await fetch(`${API_BASE_URL}/api/bazaar/negotiate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          boutique_id: selectedProduct.boutique || "avadh",
          product_id: selectedProduct.id || "local_1",
          original_price: selectedProduct.price,
          proposed_price: proposedBid
        })
      });
      const data = await response.json();

      setTimeout(() => {
        setIsTyping(false);
        setChatMessages(prev => [
          ...prev,
          {
            sender: "shop",
            text: data.message,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        setNegotiatedPrice(data.final_price);
        if (data.status === "accepted") {
          setChatRound(2); // Accepted directly
        }
      }, 1500);

    } catch (err) {
      console.error("Failed to connect to backend negotiation engine:", err);
      // Fallback message
      setTimeout(() => {
        setIsTyping(false);
        setChatMessages(prev => [
          ...prev,
          { sender: "shop", text: `Namaste! We can offer you ₹${Math.round(selectedProduct.price * 0.90)} as a special boutique price.`, time: "11:32 AM" }
        ]);
      }, 1200);
    }
  };

  // User counter bid in chat window
  const handleUserCounterBid = async (price: number) => {
    if (!selectedProduct) return;
    setIsTyping(true);

    const userMsg = {
      sender: "user" as const,
      text: `How about ₹${price}?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages(prev => [...prev, userMsg]);

    try {
      const response = await fetch(`${API_BASE_URL}/api/bazaar/negotiate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          boutique_id: selectedProduct.boutique || "avadh",
          product_id: selectedProduct.id || "local_1",
          original_price: selectedProduct.price,
          proposed_price: price
        })
      });
      const data = await response.json();

      setTimeout(() => {
        setIsTyping(false);
        setChatMessages(prev => [
          ...prev,
          {
            sender: "shop",
            text: data.message,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        setNegotiatedPrice(data.final_price);
        setChatRound(2);
      }, 1500);

    } catch (err) {
      console.error(err);
      setTimeout(() => {
        setIsTyping(false);
        setChatMessages(prev => [
          ...prev,
          { sender: "shop", text: `Okay, let's meet in the middle at ₹${price}. Done deal!`, time: "11:34 AM" }
        ]);
        setNegotiatedPrice(price);
        setChatRound(2);
      }, 1200);
    }
  };

  // Accept counter offer
  const handleAcceptCounter = (price: number) => {
    setNegotiatedPrice(price);
    const userMessage = { sender: "user" as const, text: `Accepting ₹${price}. Perfect!`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setChatMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setChatMessages(prev => [
        ...prev,
        { sender: "shop" as const, text: `Thank you! Packing your order now. Proceed to select delivery.`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ]);
      setTimeout(() => {
        setStep(5);
      }, 1000);
    }, 1000);
  };

  // Freeform chat input submit
  const handleSendFreeChatMessage = () => {
    if (!userChatInput.trim() || !selectedProduct) return;
    const bidNum = parseInt(userChatInput.replace(/[^0-9]/g, ""));
    if (!isNaN(bidNum) && bidNum > 100) {
      handleUserCounterBid(bidNum);
      setUserChatInput("");
    } else {
      // Treat as regular chat text
      const userMsg = { sender: "user" as const, text: userChatInput, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      setChatMessages(prev => [...prev, userMsg]);
      setUserChatInput("");
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setChatMessages(prev => [
          ...prev,
          { sender: "shop" as const, text: "I can only negotiate on final pricing numbers. Please propose a numerical offer!", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        ]);
      }, 1200);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans relative pb-8 bg-gradient-to-b ${themeColors.bgGradient}`}>

      {/* STEP 1: Discover Nearby Products */}
      {step === 1 && (
        <>
          {/* Header */}
          <header className={`w-full px-3.5 py-3 flex items-center justify-between border-b sticky top-0 z-30 transition-all duration-300 ${themeColors.headerBg}`}>
            <div className="flex items-center gap-2">
              <Link href="/" className="p-1 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </Link>
              <span className={`font-extrabold text-sm tracking-wide ${themeColors.headerText} flex items-center gap-1.5`}>
                Apna Bazaar <span className="text-sm select-none">🌺</span>
              </span>
            </div>

            <div className="flex items-center gap-4 text-gray-600 scale-95">
              <Search className="w-4.5 h-4.5 cursor-pointer hover:text-[#ff3f6c]" />
              <Heart className="w-4.5 h-4.5 cursor-pointer hover:text-[#ff3f6c]" />
              <ShoppingBag className="w-4.5 h-4.5 cursor-pointer hover:text-[#ff3f6c]" />
            </div>
          </header>

          {/* Location selector strip */}
          <div className="px-3.5 py-1.5 flex items-center justify-between text-[10px] font-bold border-b border-gray-100 select-none bg-[#FAFAFA] text-gray-600">
            <div className="flex items-center gap-1.5 truncate relative">
              <MapPin className="w-3.5 h-3.5 shrink-0 text-purple-600" />
              <span className="truncate cursor-pointer flex items-center gap-1" onClick={() => !user?.city && setShowCityDropdown(!showCityDropdown)}>
                Delivering to {activeCity}, {getCityState(activeCity)}
                {!user?.city && <span className="text-[8px] text-gray-400 font-bold">▼</span>}
              </span>

              {!user?.city && showCityDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowCityDropdown(false)}
                  />
                  <div className="absolute top-[24px] left-0 bg-white border border-gray-200 rounded-lg shadow-lg max-h-[160px] overflow-y-auto z-50 py-1 text-[10.5px] font-bold text-gray-700 w-36">
                    {citiesList.map((c) => (
                      <div
                        key={c}
                        onClick={() => {
                          setActiveCity(c);
                          localStorage.setItem("selectedCity", c);
                          setShowCityDropdown(false);
                        }}
                        className={`px-3.5 py-2 cursor-pointer transition-colors hover:bg-pink-50 hover:text-[#ff3f6c] ${activeCity === c ? "text-[#ff3f6c] bg-pink-50/50" : ""}`}
                      >
                        {c}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
            
            <button
              onClick={() => setSelectedRadius(5)}
              className="border border-gray-200 bg-white text-slate-600 px-2 py-0.5 rounded-md text-[8.5px] font-black flex items-center gap-1 cursor-pointer hover:bg-gray-50 active:scale-95 transition-all shadow-3xs animate-none"
            >
              <Compass className="w-3 h-3 text-gray-500" />
              <span>Near Me</span>
            </button>
          </div>

          {/* Dynamic Festival Hero Banner */}
          {themeColors.name === "Ganesh Chaturthi" ? (
            <div className="mx-3.5 mt-3.5 rounded-2xl overflow-hidden border border-orange-100 bg-[#fffdf5] relative flex flex-col p-3 pt-2.5 pb-2.5 select-none h-[225px] text-left">
              {/* Background Ganesha Image on Right half */}
              <div className="absolute right-0 top-0 bottom-0 w-[55%] overflow-hidden pointer-events-none rounded-r-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-[#fffdf5] via-[#fffdf5]/85 to-transparent z-10 w-[30%]" />
                <img
                  src={themeColors.bannerImg}
                  alt={themeColors.name}
                  className="w-full h-full object-cover object-right scale-102"
                />
              </div>

              {/* Floating circular seal on right/top */}
              <div className="absolute top-2.5 right-3.5 z-20 bg-[#07362a] text-white rounded-full w-[54px] h-[54px] flex flex-col items-center justify-center text-[6.5px] font-black uppercase text-center shadow-md rotate-6 leading-tight select-none border border-emerald-800">
                <span className="text-emerald-100 font-extrabold text-[7px] leading-tight">Ganpati</span>
                <span className="text-[6.5px] leading-tight mt-0.5">Bappa</span>
                <span className="text-emerald-100 leading-tight">Morya!</span>
                <span className="text-[8px] mt-0.5">🪔</span>
              </div>

              {/* Left Content Area (Top Half) */}
              <div className="w-[58%] flex flex-col justify-center z-10 relative">
                <div className="bg-[#07362a] text-[#ffd600] text-[6px] font-black uppercase px-1.5 py-0.5 rounded w-fit tracking-wider mb-1 flex items-center gap-1 shadow-3xs leading-none">
                  <span>{themeColors.bannerTag}</span>
                </div>

                <h2 className="text-[#3c1e08] text-[16px] font-black leading-tight tracking-tight">
                  <span className="text-[#07362a] block">Happy</span>
                  <span className="text-[#ea580c] block">Ganesh Chaturthi!</span>
                </h2>

                <p className="text-slate-700 text-[8px] font-semibold leading-normal mt-0.5 max-w-[95%]">
                  {themeColors.bannerDesc}
                </p>

                <button className="mt-2 bg-[#ea580c] hover:bg-[#d97706] text-white px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-wider w-fit shadow-xs transition-all active:scale-98 cursor-pointer flex items-center gap-0.5 leading-none">
                  <span>Explore Collection</span>
                  <span>→</span>
                </button>
              </div>

              {/* Banner Category Icons (Bottom Half) */}
              <div className="mt-2.5 pt-2 border-t border-orange-100/60 z-10 flex items-center gap-3 justify-start overflow-x-auto scrollbar-none w-full">
                {[
                  { name: "Puja Essentials", img: "/ganesh_category_puja.png", value: "Puja Essentials" },
                  { name: "Idols", img: "/ganesh_category_idols.png", value: "Idols" },
                  { name: "Decor", img: "/pooja_setup_category.png", value: "Decor" },
                  { name: "Gifts", img: "/pooja_essentials_category.png", value: "Gifts" },
                  { name: "More", img: null, value: "All" }
                ].map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveCategory(item.value)}
                    className="flex flex-col items-center gap-0.5 cursor-pointer shrink-0"
                  >
                    <div className="w-8 h-8 rounded-full bg-white border border-orange-100 flex items-center justify-center shadow-3xs overflow-hidden">
                      {item.img ? (
                        <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="grid grid-cols-2 gap-0.5 w-2.5 h-2.5">
                          <span className="border border-orange-400 rounded-3xs bg-orange-400"></span>
                          <span className="border border-orange-400 rounded-3xs bg-orange-400"></span>
                          <span className="border border-orange-400 rounded-3xs bg-orange-400"></span>
                          <span className="border border-orange-400 rounded-3xs bg-orange-400"></span>
                        </div>
                      )}
                    </div>
                    <span className="text-[7px] font-extrabold text-slate-700 leading-none whitespace-nowrap">
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>

              {/* Slider Dots */}
              <div className="mt-2 flex gap-1 items-center justify-center z-20 w-full">
                {[0, 1, 2, 3, 4].map((idx) => (
                  <span
                    key={idx}
                    className={`w-1 h-1 rounded-full transition-all ${idx === 0 ? "bg-[#ea580c] w-2" : "bg-gray-300"}`}
                  />
                ))}
              </div>
            </div>
          ) : themeColors.name === "Chhath Puja" ? (
            <div className="mx-3.5 mt-3.5 rounded-2xl overflow-hidden border border-orange-100 bg-[#2d1a3c] relative flex flex-col p-3.5 pt-3 pb-2.5 select-none h-[180px] text-left">
              {/* Background Sun Image on Right half */}
              <div className="absolute right-0 top-0 bottom-0 w-[55%] overflow-hidden pointer-events-none rounded-r-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-[#2d1a3c] via-[#2d1a3c]/60 to-transparent z-10 w-[30%]" />
                <img
                  src={themeColors.bannerImg}
                  alt={themeColors.name}
                  className="w-full h-full object-cover object-right scale-102"
                />
              </div>

              {/* Left Content Area (Top Half) */}
              <div className="w-[58%] flex flex-col justify-center z-10 relative">
                <div className="bg-white/10 text-[#ffd700] text-[6.5px] font-black uppercase px-2 py-0.5 rounded w-fit tracking-wider mb-2 flex items-center gap-1 shadow-3xs leading-none border border-white/5">
                  <span>{themeColors.bannerTag}</span>
                </div>

                <h2 className="text-[#ffd700] text-[16px] font-black leading-tight tracking-tight flex items-center gap-1">
                  Happy Chhath Puja <span className="text-yellow-400">☀️</span>
                </h2>

                <p className="text-slate-200 text-[8px] font-medium leading-normal mt-1 max-w-[95%]">
                  {themeColors.bannerDesc}
                </p>
                <button
                  onClick={togglePlayPause}
                  className={`mt-2 px-3 py-1.5 text-[#2d1a3c] text-[8.5px] font-black rounded-full shadow-md flex items-center gap-1.5 active:scale-95 transition-all w-fit cursor-pointer border-none ${isMusicPlaying
                    ? "bg-emerald-300 hover:bg-emerald-400"
                    : "bg-[#ffd700] hover:bg-yellow-400"
                    }`}
                >
                  <span>{isMusicPlaying ? "Ambience Active 🎵" : "Celebrate Chhath ☀️"}</span>
                  <Sparkles className="w-2.5 h-2.5 animate-pulse" />
                </button>
              </div>

              {/* Banner Category Icons (Bottom Half) */}
              <div className="mt-4 pt-2.5 border-t border-white/10 z-10 flex items-center gap-3.5 justify-start overflow-x-auto scrollbar-none w-full">
                {[
                  { name: "Puja Samagri", img: "/ganesh_category_puja.png", value: "Puja Essentials" },
                  { name: "Sarees", img: "/ethnic_wear_category.png", value: "Sarees" },
                  { name: "Accessories", img: "/traditional_food_category.png", value: "Accessories" },
                  { name: "Gifts", img: "/pooja_essentials_category.png", value: "Gifts" }
                ].map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveCategory(item.value)}
                    className="flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <div className="w-5.5 h-5.5 rounded-full bg-white/10 border border-white/10 flex items-center justify-center overflow-hidden">
                      <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[7.5px] font-bold text-slate-100 whitespace-nowrap">
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>

              {/* Slider Dots */}
              <div className="mt-2.5 flex gap-1 items-center justify-center z-20 w-full">
                {[0, 1, 2, 3].map((idx) => (
                  <span
                    key={idx}
                    className={`w-1 h-1 rounded-full transition-all ${idx === 0 ? "bg-[#ff3f6c] w-2" : "bg-white/30"}`}
                  />
                ))}
              </div>
            </div>
          ) : themeColors.name === "Varalakshmi Vratam" ? (
            <div className="mx-3.5 mt-3.5 rounded-2xl overflow-hidden border border-purple-100 bg-[#3b1154] relative flex flex-col p-3.5 pt-3 pb-2 select-none h-[220px] text-left">
              {/* Background Lakshmi Image on Right half */}
              <div className="absolute right-0 top-0 bottom-0 w-[55%] overflow-hidden pointer-events-none rounded-r-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-[#3b1154] via-[#3b1154]/60 to-transparent z-10 w-[30%]" />
                <img
                  src={themeColors.bannerImg}
                  alt={themeColors.name}
                  className="w-full h-full object-cover object-right scale-102"
                />
              </div>

              {/* Left Content Area (Top Half) */}
              <div className="w-[58%] flex flex-col justify-center z-10 relative">
                <div className="bg-white/10 text-[#ffd700] text-[6.5px] font-black uppercase px-2 py-0.5 rounded w-fit tracking-wider mb-2 flex items-center gap-1 shadow-3xs leading-none border border-white/5">
                  <span>{themeColors.bannerTag}</span>
                </div>

                <h2 className="text-white text-[16px] font-black leading-tight tracking-tight">
                  Happy <br />
                  <span className="text-[#ffd700]">{themeColors.bannerHighlight}</span>
                </h2>

                <p className="text-purple-200 text-[8px] font-medium leading-normal mt-1 max-w-[95%]">
                  {themeColors.bannerDesc}
                </p>
                <button
                  onClick={togglePlayPause}
                  className={`mt-2 px-3 py-1.5 text-purple-950 text-[8.5px] font-black rounded-full shadow-md flex items-center gap-1.5 active:scale-95 transition-all w-fit cursor-pointer border-none ${isMusicPlaying
                    ? "bg-emerald-300 hover:bg-emerald-400 text-slate-900"
                    : "bg-[#ffd700] hover:bg-yellow-400"
                    }`}
                >
                  <span>{isMusicPlaying ? "Ambience Active 🎵" : "Celebrate Varalakshmi 🪷"}</span>
                  <Sparkles className="w-2.5 h-2.5 animate-pulse" />
                </button>
              </div>

              {/* Banner Category Icons (Bottom Half) */}
              <div className="mt-2.5 pt-2 border-t border-white/10 z-10 flex items-center gap-3.5 justify-start overflow-x-auto scrollbar-none w-full">
                {[
                  { name: "Puja Samagri", img: "/ganesh_category_puja.png", value: "Puja Essentials" },
                  { name: "Sarees", img: "/ethnic_wear_category.png", value: "Sarees" },
                  { name: "Flowers", img: "/fresh_pooja_flowers.png", value: "Flowers" },
                  { name: "Gifts", img: "/pooja_essentials_category.png", value: "Gifts" },
                  { name: "More", img: null, value: "All" }
                ].map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveCategory(item.value)}
                    className="flex flex-col items-center gap-0.5 cursor-pointer shrink-0"
                  >
                    <div className="w-8 h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center overflow-hidden">
                      {item.img ? (
                        <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="grid grid-cols-2 gap-0.5 w-2.5 h-2.5">
                          <span className="border border-purple-400 rounded-3xs bg-purple-400"></span>
                          <span className="border border-purple-400 rounded-3xs bg-purple-400"></span>
                          <span className="border border-purple-400 rounded-3xs bg-purple-400"></span>
                          <span className="border border-purple-400 rounded-3xs bg-purple-400"></span>
                        </div>
                      )}
                    </div>
                    <span className="text-[7.5px] font-bold text-slate-100 whitespace-nowrap mt-0.5">
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>

              {/* Slider Dots */}
              <div className="mt-2 flex gap-1 items-center justify-center z-20 w-full">
                {[0, 1, 2, 3].map((idx) => (
                  <span
                    key={idx}
                    className={`w-1 h-1 rounded-full transition-all ${idx === 0 ? "bg-purple-500 w-2" : "bg-white/30"}`}
                  />
                ))}
              </div>
            </div>
          ) : themeColors.name === "Lohri" ? (
            <div className="mx-3.5 mt-3.5 rounded-2xl overflow-hidden border border-orange-100/60 bg-[#1a0a00] relative flex flex-col p-3.5 pt-3 pb-2 select-none h-[220px] text-left">
              {/* Background bonfire image on Right */}
              <div className="absolute right-0 top-0 bottom-0 w-[60%] overflow-hidden pointer-events-none rounded-r-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-[#1a0a00] via-[#1a0a00]/55 to-transparent z-10 w-[35%]" />
                <img
                  src={themeColors.bannerImg}
                  alt={themeColors.name}
                  className="w-full h-full object-cover object-center scale-102"
                />
              </div>

              {/* Date badge top right */}
              <div className="absolute top-3 right-3 z-20 w-12 h-12 rounded-full bg-[#ea580c] border-2 border-orange-300/40 flex flex-col items-center justify-center text-white shadow-lg">
                <span className="text-[8px] font-black leading-none">Lohri</span>
                <span className="text-[6.5px] font-extrabold text-orange-100 leading-none mt-0.5">13 JAN</span>
              </div>

              {/* Left Content Area */}
              <div className="w-[55%] flex flex-col justify-center z-10 relative">
                <div className="bg-[#ea580c]/90 text-white text-[6.5px] font-black uppercase px-2 py-0.5 rounded-sm w-fit tracking-wider mb-2 flex items-center gap-1 leading-none border border-orange-400/30">
                  <span>{themeColors.bannerTag}</span>
                </div>

                <h2 className="text-white text-[17px] font-black leading-tight tracking-tight">
                  Happy Lohri! <span className="text-orange-400">🔥</span>
                </h2>

                <p className="text-orange-100/80 text-[7.5px] font-medium leading-snug mt-1 max-w-[100%]">
                  {themeColors.bannerDesc}
                </p>
              </div>

              {/* Banner Category Icons */}
              <div className="mt-2.5 pt-2 border-t border-white/10 z-10 flex items-center gap-3.5 justify-start overflow-x-auto scrollbar-none w-full">
                {[
                  { name: "Attire", img: "/ethnic_wear_category.png", value: "All" },
                  { name: "Footwear", img: "/traditional_food_category.png", value: "Accessories" },
                  { name: "Decor", img: "/pooja_setup_category.png", value: "All" },
                  { name: "Accessories", img: "/pooja_essentials_category.png", value: "Accessories" },
                  { name: "More", img: null, value: "All" }
                ].map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveCategory(item.value)}
                    className="flex flex-col items-center gap-0.5 cursor-pointer shrink-0"
                  >
                    <div className="w-8 h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center overflow-hidden">
                      {item.img ? (
                        <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="grid grid-cols-2 gap-0.5 w-2.5 h-2.5">
                          <span className="border border-orange-400 rounded-3xs bg-orange-400"></span>
                          <span className="border border-orange-400 rounded-3xs bg-orange-400"></span>
                          <span className="border border-orange-400 rounded-3xs bg-orange-400"></span>
                          <span className="border border-orange-400 rounded-3xs bg-orange-400"></span>
                        </div>
                      )}
                    </div>
                    <span className="text-[7.5px] font-bold text-orange-100 whitespace-nowrap mt-0.5">
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>

              {/* Slider Dots */}
              <div className="mt-2 flex gap-1 items-center justify-center z-20 w-full">
                {[0, 1, 2, 3].map((idx) => (
                  <span
                    key={idx}
                    className={`w-1 h-1 rounded-full transition-all ${idx === 0 ? "bg-orange-500 w-2" : "bg-white/30"}`}
                  />
                ))}
              </div>
            </div>
          ) : themeColors.name === "Durga Puja" ? (
            <div className="mx-3.5 mt-3.5 rounded-2xl overflow-hidden border border-red-100 bg-[#7c1d2e] relative flex flex-col p-3.5 pt-3 pb-2 select-none h-[220px] text-left">
              {/* Background Durga Image on Right half */}
              <div className="absolute right-0 top-0 bottom-0 w-[55%] overflow-hidden pointer-events-none rounded-r-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-[#7c1d2e] via-[#7c1d2e]/60 to-transparent z-10 w-[30%]" />
                <img
                  src={themeColors.bannerImg}
                  alt={themeColors.name}
                  className="w-full h-full object-cover object-center scale-102"
                />
              </div>

              {/* Left Content Area (Top Half) */}
              <div className="w-[58%] flex flex-col justify-center z-10 relative">
                <div className="bg-[#be123c] text-white text-[6.5px] font-black uppercase px-2 py-0.5 rounded w-fit tracking-wider mb-2 flex items-center gap-1 shadow-3xs leading-none border border-white/5">
                  <span>{themeColors.bannerTag}</span>
                </div>

                <h2 className="text-white text-[16px] font-black leading-tight tracking-tight">
                  Happy <br />
                  <span className="text-[#ffd700]">{themeColors.bannerHighlight}</span>
                </h2>

                <p className="text-red-100 text-[8px] font-medium leading-normal mt-1 max-w-[95%]">
                  {themeColors.bannerDesc}
                </p>
              </div>

              {/* Banner Category Icons (Bottom Half) */}
              <div className="mt-2.5 pt-2 border-t border-white/10 z-10 flex items-center gap-3.5 justify-start overflow-x-auto scrollbar-none w-full">
                {[
                  { name: "Pujo Essentials", img: "/ganesh_category_puja.png", value: "Pujo Essentials" },
                  { name: "Sarees", img: "/ethnic_wear_category.png", value: "Sarees" },
                  { name: "Dhak & Dhunuchi", img: "/pooja_setup_category.png", value: "Pujo Essentials" },
                  { name: "Decor", img: "/pooja_setup_category.png", value: "Decor" },
                  { name: "More", img: null, value: "All" }
                ].map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveCategory(item.value)}
                    className="flex flex-col items-center gap-0.5 cursor-pointer shrink-0"
                  >
                    <div className="w-8 h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center overflow-hidden">
                      {item.img ? (
                        <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="grid grid-cols-2 gap-0.5 w-2.5 h-2.5">
                          <span className="border border-red-400 rounded-3xs bg-red-400"></span>
                          <span className="border border-red-400 rounded-3xs bg-red-400"></span>
                          <span className="border border-red-400 rounded-3xs bg-red-400"></span>
                          <span className="border border-red-400 rounded-3xs bg-red-400"></span>
                        </div>
                      )}
                    </div>
                    <span className="text-[7.5px] font-bold text-slate-100 whitespace-nowrap mt-0.5">
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>

              {/* Pujo Countdown Floating Badge on the right */}
              <div className="absolute top-3.5 right-3.5 z-20 bg-[#be123c] border-2 border-white/80 text-white rounded-full w-[54px] h-[54px] flex flex-col items-center justify-center shadow-lg leading-tight scale-102 select-none">
                <span className="text-[5.5px] font-black uppercase text-red-100 leading-none">Pujo</span>
                <span className="text-[5.5px] font-black uppercase text-red-100 leading-none">Countdown</span>
                <span className="text-[14px] font-black text-white leading-none my-0.5">10</span>
                <span className="text-[5px] font-extrabold text-red-150 leading-none">Days to Go</span>
              </div>

              {/* Slider Dots */}
              <div className="mt-2 flex gap-1 items-center justify-center z-20 w-full">
                {[0, 1, 2, 3].map((idx) => (
                  <span
                    key={idx}
                    className={`w-1 h-1 rounded-full transition-all ${idx === 0 ? "bg-red-500 w-2" : "bg-white/30"}`}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-3.5 mt-3.5 rounded-2xl overflow-hidden shadow-xs border border-gray-100 bg-[#fffdf5] relative h-[148px] flex items-center select-none">
              {/* Background Image on Right half */}
              <div className="absolute right-0 top-0 bottom-0 w-[58%] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-[#fffdf5] via-[#fffdf5]/80 to-transparent z-10 w-[30%]" />
                <img
                  src={themeColors.bannerImg}
                  alt={themeColors.name}
                  className="w-full h-full object-cover object-center scale-102"
                />
              </div>

              {/* Content on Left half */}
              <div className="w-[55%] flex flex-col justify-center text-left p-4.5 z-10 relative">
                <div className="bg-white/80 backdrop-blur-xs border border-amber-200/50 text-[#b45309] text-[7.5px] font-black uppercase px-2 py-0.5 rounded-full w-fit tracking-wider mb-2 flex items-center gap-1 shadow-3xs">
                  <span>{themeColors.bannerTag}</span>
                </div>

                <h2 className="text-[#3c1e08] text-[15px] font-black leading-tight tracking-tight">
                  {themeColors.bannerTitle}
                  <span className="text-[#ff3f6c]">{themeColors.bannerHighlight}</span>
                </h2>

                <p className="text-[#5c4a3c] text-[8.5px] font-bold leading-snug mt-1 max-w-[95%]">
                  {themeColors.bannerDesc}
                </p>

                <button className="mt-3 bg-[#ff3f6c] hover:bg-[#e02f59] text-[#fff] px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider w-fit shadow-xs transition-all active:scale-98 cursor-pointer flex items-center gap-1">
                  <span>{themeColors.bannerBtn}</span>
                  <span>→</span>
                </button>
              </div>

              {/* Floating Badge */}
              <div className="absolute top-4 right-4 z-20 bg-rose-600 border border-white text-white rounded-full w-[46px] h-[46px] flex flex-col items-center justify-center text-[7.5px] font-black uppercase shadow-md rotate-12 scale-102 leading-tight">
                <span>{themeColors.bannerBadge.split(' ')[0]}</span>
                <span className="text-[6.5px] font-extrabold text-rose-100">{themeColors.bannerBadge.split(' ')[1] || "Special"}</span>
              </div>

              {/* Slider Dots */}
              <div className="absolute bottom-3 left-4.5 z-20 flex gap-1 items-center">
                {[0, 1, 2, 3].map((idx) => (
                  <span
                    key={idx}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${idx === 0 ? "bg-[#ff3f6c] w-3" : "bg-gray-300"}`}
                  />
                ))}
              </div>
            </div>
          )}



          {/* Nearby Sellers — Delivery Speed Chips + Seller List */}
          <div className="mx-3.5 mt-3.5 select-none">
            {/* Delivery Speed Chips */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
              {[
                { r: 2, label: "Under 30 min", icon: "⚡" },
                { r: 5, label: "Within 2 hrs", icon: "🚀" },
                { r: 10, label: "Within 4 hrs", icon: "📦" },
                { r: 15, label: "Same Day", icon: "🛍️" }
              ].map((item) => {
                const isActive = selectedRadius === item.r;
                const count = boutiques.filter(b => b.distance <= item.r).length;
                return (
                  <button
                    key={item.r}
                    onClick={() => setSelectedRadius(item.r)}
                    className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[11px] font-bold border transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#ff3f6c] border-[#ff3f6c] text-white shadow-sm"
                        : "bg-white border-gray-200 text-[#282c3f] hover:border-gray-300"
                    }`}
                  >
                    <span className="text-xs">{item.icon}</span>
                    <span>{item.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      isActive ? "bg-white/20 text-white" : "bg-gray-100 text-[#535766]"
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Seller Cards — Horizontal Scroll */}
            <div className="mt-3 -mx-3.5 px-3.5">
              <div className="flex gap-3 overflow-x-auto scrollbar-none pb-2">
                {filteredBoutiques.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => setSelectedBoutique(b.name === selectedBoutique ? null : b.name)}
                    className={`shrink-0 w-[200px] bg-white border rounded-lg p-3 cursor-pointer transition-all hover:shadow-md ${
                      selectedBoutique === b.name
                        ? "border-[#ff3f6c] shadow-sm"
                        : "border-gray-200"
                    }`}
                  >
                    {/* Header row */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100">
                          <Store className="w-4 h-4 text-[#ff3f6c]" />
                        </div>
                        <div>
                          <div className="text-[12px] font-bold text-[#282c3f] leading-tight line-clamp-1 max-w-[120px]">{b.name}</div>
                          {b.verified && (
                            <div className="flex items-center gap-0.5 mt-0.5">
                              <CheckCircle className="w-2.5 h-2.5 text-teal-600" />
                              <span className="text-[9px] font-bold text-teal-600">Verified</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 bg-[#14958f] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm shrink-0">
                        <span>{b.rating}</span>
                        <span className="text-[8px]">★</span>
                      </div>
                    </div>

                    {/* Speciality */}
                    <p className="text-[10px] text-[#535766] mt-2 line-clamp-2 leading-relaxed">{b.speciality}</p>

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-1 text-[10px] text-[#282c3f]">
                        <MapPin className="w-3 h-3 text-[#ff3f6c]" />
                        <span className="font-bold">{b.distance} km away</span>
                      </div>
                      <span className="text-[10px] font-bold text-[#14958f]">
                        {b.distance <= 1.5 ? '10-15 min' : b.distance <= 2.5 ? '20-30 min' : b.distance <= 4.0 ? '1-2 hrs' : b.distance <= 6.0 ? '2-3 hrs' : 'Same-Day'}
                      </span>
                    </div>
                  </div>
                ))}

                {filteredBoutiques.length === 0 && (
                  <div className="w-full py-6 text-center">
                    <p className="text-[12px] text-[#535766]">No sellers found in this delivery window.</p>
                    <button
                      onClick={() => setSelectedRadius(15)}
                      className="text-[12px] font-bold text-[#ff3f6c] mt-1 hover:underline"
                    >
                      Try Same-Day delivery →
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Trust strip */}
            <div className="mt-3 flex items-center justify-between bg-[#fafafa] border border-gray-100 rounded-lg px-4 py-2.5">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#14958f]" />
                <span className="text-[11px] font-bold text-[#282c3f]">All Sellers Verified</span>
              </div>
              <div className="h-3 w-px bg-gray-200" />
              <div className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#14958f]" />
                <span className="text-[11px] font-bold text-[#282c3f]">Easy Returns</span>
              </div>
              <div className="h-3 w-px bg-gray-200" />
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-[#14958f]" />
                <span className="text-[11px] font-bold text-[#282c3f]">Fast Delivery</span>
              </div>
            </div>
          </div>

          {/* Visual circular essentials row */}
          <div className="mx-3.5 mt-3.5 bg-white border border-gray-100 rounded-2xl p-4 text-left shadow-3xs select-none">
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-1.5">
                <span className="text-xs">
                  {themeColors.name === "Ganesh Chaturthi" ? "🌼" : themeColors.name === "Chhath Puja" ? "🌅" : themeColors.name === "Varalakshmi Vratam" ? "🪻" : themeColors.name === "Lohri" ? "🔥" : themeColors.name === "Durga Puja" ? "🔱" : "🏺"}
                </span>
                <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-wider">
                  {themeColors.name === "Ganesh Chaturthi"
                    ? "Ganesh Chaturthi Essentials"
                    : themeColors.name === "Chhath Puja"
                      ? "Chhath Essentials"
                      : themeColors.name === "Varalakshmi Vratam"
                        ? "Vratam Essentials"
                        : themeColors.name === "Lohri"
                          ? "Lohri Essentials"
                          : themeColors.name === "Durga Puja"
                            ? "Pujo Essentials"
                            : `${themeColors.name.split(' ')[0]} Essentials`}
                </h3>
              </div>
              <button
                onClick={() => {
                  if (themeColors.name === "Ganesh Chaturthi" || themeColors.name === "Chhath Puja" || themeColors.name === "Varalakshmi Vratam" || themeColors.name === "Lohri" || themeColors.name === "Durga Puja") {
                    setActiveCategory("All");
                  } else {
                    setActiveCategory("Accessories");
                  }
                }}
                className="text-[9.5px] font-black hover:underline flex items-center gap-0.5"
                style={{ color: themeColors.hexColor }}
              >
                <span>View all</span>
                <span>→</span>
              </button>
            </div>

            <div className="flex items-center gap-4 overflow-x-auto pb-1 scrollbar-none w-full justify-start">
              {themeColors.name === "Ganesh Chaturthi" ? (
                <>
                  {[
                    { name: "Puja Essentials", img: "/ganesh_category_puja.png", value: "Puja Essentials" },
                    { name: "Idols", img: "/ganesh_category_idols.png", value: "Idols" },
                    { name: "Decorations", img: "/pooja_setup_category.png", value: "Decor" },
                    { name: "Footwear & Juttis", img: "/traditional_food_category.png", value: "Footwear" },
                    { name: "Gifts & Hampers", img: "/pooja_essentials_category.png", value: "Gifts" },
                    { name: "More", img: null, value: "All" }
                  ].map((cat, idx) => {
                    const isSelected = activeCategory === cat.value;
                    return (
                      <div
                        key={idx}
                        onClick={() => setActiveCategory(cat.value)}
                        className="flex flex-col items-center gap-1.5 cursor-pointer shrink-0 group"
                      >
                        <div
                          className={`w-13 h-13 rounded-full overflow-hidden border bg-white flex items-center justify-center transition-all ${
                            isSelected ? "border-2 scale-102" : "border-gray-200 hover:scale-102 hover:border-[#ff3f6c]/50"
                          }`}
                          style={isSelected ? { borderColor: themeColors.hexColor, boxShadow: `0 0 8px ${themeColors.hexColor}33` } : {}}
                        >
                          {cat.img ? (
                            <img src={cat.img} alt={cat.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="grid grid-cols-2 gap-0.5 w-4 h-4">
                              <span className="border border-orange-400 rounded-2xs bg-orange-400"></span>
                              <span className="border border-orange-400 rounded-2xs bg-orange-400"></span>
                              <span className="border border-orange-400 rounded-2xs bg-orange-400"></span>
                              <span className="border border-orange-400 rounded-2xs bg-orange-400"></span>
                            </div>
                          )}
                        </div>
                        <span className={`text-[8.5px] font-bold tracking-tight leading-tight max-w-[62px] text-center ${
                          isSelected ? "text-[#ff3f6c]" : "text-slate-700"
                        }`}>
                          {cat.name}
                        </span>
                      </div>
                    );
                  })}
                </>
              ) : themeColors.name === "Chhath Puja" ? (
                <>
                  {[
                    { name: "Puja Samagri", img: "/ganesh_category_puja.png", value: "Puja Essentials" },
                    { name: "Accessories", img: "/traditional_food_category.png", value: "Accessories" },
                    { name: "Sarees", img: "/ethnic_wear_category.png", value: "Sarees" },
                    { name: "More", img: null, value: "All" }
                  ].map((cat, idx) => {
                    const isSelected = activeCategory === cat.value;
                    return (
                      <div
                        key={idx}
                        onClick={() => setActiveCategory(cat.value)}
                        className="flex flex-col items-center gap-1.5 cursor-pointer shrink-0 group"
                      >
                        <div
                          className={`w-13 h-13 rounded-full overflow-hidden border bg-white flex items-center justify-center transition-all ${
                            isSelected ? "border-2 scale-102" : "border-gray-200 hover:scale-102 hover:border-[#ff3f6c]/50"
                          }`}
                          style={isSelected ? { borderColor: themeColors.hexColor, boxShadow: `0 0 8px ${themeColors.hexColor}33` } : {}}
                        >
                          {cat.img ? (
                            <img src={cat.img} alt={cat.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="grid grid-cols-2 gap-0.5 w-4 h-4">
                              <span className="border border-pink-400 rounded-2xs bg-pink-400"></span>
                              <span className="border border-pink-400 rounded-2xs bg-pink-400"></span>
                              <span className="border border-pink-400 rounded-2xs bg-pink-400"></span>
                              <span className="border border-pink-400 rounded-2xs bg-pink-400"></span>
                            </div>
                          )}
                        </div>
                        <span className={`text-[8.5px] font-bold tracking-tight leading-tight max-w-[62px] text-center ${
                          isSelected ? "text-[#ff3f6c]" : "text-slate-700"
                        }`}>
                          {cat.name}
                        </span>
                      </div>
                    );
                  })}
                </>
              ) : themeColors.name === "Lohri" ? (
                <>
                  {[
                    { name: "Kurta Pajama", img: "/lohri_kurta_store.png", value: "All" },
                    { name: "Phulkari Dupatta", img: "/ethnic_wear_category.png", value: "All" },
                    { name: "Footwear", img: "/traditional_food_category.png", value: "Accessories" },
                    { name: "Jewellery", img: "/pooja_essentials_category.png", value: "Accessories" },
                    { name: "Kites", img: "/pooja_setup_category.png", value: "All" },
                    { name: "Accessories", img: "/pooja_essentials_category.png", value: "Accessories" },
                    { name: "More", img: null, value: "All" }
                  ].map((cat, idx) => {
                    const isSelected = activeCategory === cat.value;
                    return (
                      <div
                        key={idx}
                        onClick={() => setActiveCategory(cat.value)}
                        className="flex flex-col items-center gap-1.5 cursor-pointer shrink-0 group"
                      >
                        <div
                          className={`w-13 h-13 rounded-full overflow-hidden border bg-white flex items-center justify-center transition-all ${
                            isSelected ? "border-2 scale-102" : "border-gray-200 hover:scale-102 hover:border-[#ff3f6c]/50"
                          }`}
                          style={isSelected ? { borderColor: themeColors.hexColor, boxShadow: `0 0 8px ${themeColors.hexColor}33` } : {}}
                        >
                          {cat.img ? (
                            <img src={cat.img} alt={cat.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="grid grid-cols-2 gap-0.5 w-4 h-4">
                              <span className="border border-orange-400 rounded-2xs bg-orange-400"></span>
                              <span className="border border-orange-400 rounded-2xs bg-orange-400"></span>
                              <span className="border border-orange-400 rounded-2xs bg-orange-400"></span>
                              <span className="border border-orange-400 rounded-2xs bg-orange-400"></span>
                            </div>
                          )}
                        </div>
                        <span className={`text-[8.5px] font-bold tracking-tight leading-tight max-w-[62px] text-center ${
                          isSelected ? "text-[#ff3f6c]" : "text-slate-700"
                        }`}>
                          {cat.name}
                        </span>
                      </div>
                    );
                  })}
                </>
              ) : themeColors.name === "Varalakshmi Vratam" ? (
                <>
                  {[
                    { name: "Puja Samagri", img: "/ganesh_category_puja.png", value: "Puja Essentials" },
                    { name: "Flowers & Garlands", img: "/fresh_pooja_flowers.png", value: "Flowers" },
                    { name: "Sarees", img: "/ethnic_wear_category.png", value: "Sarees" },
                    { name: "Jewellery", img: "/pooja_essentials_category.png", value: "Accessories" },
                    { name: "More", img: null, value: "All" }
                  ].map((cat, idx) => {
                    const isSelected = activeCategory === cat.value;
                    return (
                      <div
                        key={idx}
                        onClick={() => setActiveCategory(cat.value)}
                        className="flex flex-col items-center gap-1.5 cursor-pointer shrink-0 group"
                      >
                        <div
                          className={`w-13 h-13 rounded-full overflow-hidden border bg-white flex items-center justify-center transition-all ${
                            isSelected ? "border-2 scale-102" : "border-gray-200 hover:scale-102 hover:border-[#ff3f6c]/50"
                          }`}
                          style={isSelected ? { borderColor: themeColors.hexColor, boxShadow: `0 0 8px ${themeColors.hexColor}33` } : {}}
                        >
                          {cat.img ? (
                            <img src={cat.img} alt={cat.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="grid grid-cols-2 gap-0.5 w-4 h-4">
                              <span className="border border-purple-400 rounded-2xs bg-purple-400"></span>
                              <span className="border border-purple-400 rounded-2xs bg-purple-400"></span>
                              <span className="border border-purple-400 rounded-2xs bg-purple-400"></span>
                              <span className="border border-purple-400 rounded-2xs bg-purple-400"></span>
                            </div>
                          )}
                        </div>
                        <span className={`text-[8.5px] font-bold tracking-tight leading-tight max-w-[62px] text-center ${
                          isSelected ? "text-[#ff3f6c]" : "text-slate-700"
                        }`}>
                          {cat.name}
                        </span>
                      </div>
                    );
                  })}
                </>
              ) : themeColors.name === "Durga Puja" ? (
                <>
                  {[
                    { name: "Pujo Thali", img: "/ganesh_category_puja.png", value: "Pujo Essentials" },
                    { name: "Dhuno & Dhup", img: "/pooja_setup_category.png", value: "Pujo Essentials" },
                    { name: "Sarees", img: "/ethnic_wear_category.png", value: "Sarees" },
                    { name: "Decorations", img: "/pooja_setup_category.png", value: "Decor" },
                    { name: "Idols", img: "/ganesh_category_idols.png", value: "Idols" },
                    { name: "Gifts & Hampers", img: "/pooja_essentials_category.png", value: "Gifts" },
                    { name: "More", img: null, value: "All" }
                  ].map((cat, idx) => {
                    const isSelected = activeCategory === cat.value;
                    return (
                      <div
                        key={idx}
                        onClick={() => setActiveCategory(cat.value)}
                        className="flex flex-col items-center gap-1.5 cursor-pointer shrink-0 group"
                      >
                        <div
                          className={`w-13 h-13 rounded-full overflow-hidden border bg-white flex items-center justify-center transition-all ${
                            isSelected ? "border-2 scale-102" : "border-gray-200 hover:scale-102 hover:border-[#ff3f6c]/50"
                          }`}
                          style={isSelected ? { borderColor: themeColors.hexColor, boxShadow: `0 0 8px ${themeColors.hexColor}33` } : {}}
                        >
                          {cat.img ? (
                            <img src={cat.img} alt={cat.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="grid grid-cols-2 gap-0.5 w-4 h-4">
                              <span className="border border-red-400 rounded-2xs bg-red-400"></span>
                              <span className="border border-red-400 rounded-2xs bg-red-400"></span>
                              <span className="border border-red-400 rounded-2xs bg-red-400"></span>
                              <span className="border border-red-400 rounded-2xs bg-red-400"></span>
                            </div>
                          )}
                        </div>
                        <span className={`text-[8.5px] font-bold tracking-tight leading-tight max-w-[62px] text-center ${
                          isSelected ? "text-[#ff3f6c]" : "text-slate-700"
                        }`}>
                          {cat.name}
                        </span>
                      </div>
                    );
                  })}
                </>
              ) : (
                <>
                  {themeColors.categories.map((cat: any, idx: number) => {
                    const isSelected = activeCategory === (cat.value || cat.name);
                    return (
                      <div
                        key={idx}
                        onClick={() => setActiveCategory(cat.value || cat.name)}
                        className="flex flex-col items-center gap-1.5 cursor-pointer shrink-0 group"
                      >
                        <div 
                          className={`w-13 h-13 rounded-full overflow-hidden border bg-white flex items-center justify-center transition-all ${
                            isSelected ? "border-2 scale-102" : "border-gray-200 hover:scale-102 hover:border-[#ff3f6c]/50"
                          }`}
                          style={isSelected ? { borderColor: themeColors.hexColor, boxShadow: `0 0 8px ${themeColors.hexColor}33` } : {}}
                        >
                          {cat.img ? (
                            <img src={cat.img} alt={cat.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="grid grid-cols-2 gap-0.5 w-4 h-4">
                              <span className="border border-gray-400 rounded-2xs"></span>
                              <span className="border border-gray-400 rounded-2xs"></span>
                              <span className="border border-gray-400 rounded-2xs"></span>
                              <span className="border border-gray-400 rounded-2xs"></span>
                            </div>
                          )}
                        </div>
                        <span className={`text-[8.5px] font-bold tracking-tight leading-tight max-w-[62px] text-center ${
                          isSelected ? "text-[#ff3f6c]" : "text-slate-700"
                        }`}>
                          {cat.name}
                        </span>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </div>

          {/* Discover Catalog Items */}
          <main className="flex-1 px-3.5 py-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className={`text-xs font-black uppercase tracking-wider ${themeColors.textDark}`}>Verified Local Attires</h3>
              <div className="flex items-center gap-2">
                <span className={`text-[9.5px] font-extrabold ${themeColors.textMuted}`}>Same-Day Delivery</span>
                <button className="border border-gray-200 bg-white text-slate-600 px-2 py-0.5 rounded-md text-[8.5px] font-black flex items-center gap-1 cursor-pointer hover:bg-gray-50 active:scale-95 transition-all shadow-3xs">
                  <span>🎚️</span>
                  <span>Filter</span>
                </button>
              </div>
            </div>



            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none py-1 select-none">
              {uniqueCategories.map((cat, idx) => {
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={idx}
                    onClick={() => setActiveCategory(cat)}
                    style={isActive ? { backgroundColor: themeColors.hexColor, borderColor: themeColors.hexColor, color: '#fff' } : {}}
                    className={`shrink-0 px-3.5 py-1.5 rounded-full text-[11px] font-bold border transition-all cursor-pointer ${isActive
                      ? "text-white shadow-sm"
                      : "bg-white text-slate-700 border-gray-200 hover:border-slate-300"
                      }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {filteredProducts.length === 0 ? (
              <div className="border border-dashed border-gray-200 rounded-2xl p-10 text-center flex flex-col items-center justify-center gap-2">
                <Store className="w-8 h-8 text-gray-300" />
                <span className="text-xs text-gray-400 font-bold">No active local sellers found within {selectedRadius === 2 ? '30 mins' : selectedRadius === 5 ? '2 hours' : selectedRadius === 10 ? '4 hours' : '24 hours'}.</span>
                <button
                  onClick={() => { setSelectedRadius(15); setSelectedBoutique(null); }}
                  className="text-xs font-black text-[#ff3f6c] hover:underline"
                >
                  Expand search to Same-day Delivery
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-5 pb-6">
                {selectedBoutique && (
                  <div className="bg-[#fffbeb] border border-amber-200 text-amber-900 rounded-xl px-4 py-2 flex items-center justify-between text-xs font-bold shadow-3xs select-none">
                    <span>Showing catalog for <strong>{selectedBoutique}</strong></span>
                    <button
                      onClick={() => setSelectedBoutique(null)}
                      className="text-amber-600 hover:text-amber-800 font-black uppercase text-[10px] cursor-pointer"
                    >
                      Clear Filter ✕
                    </button>
                  </div>
                )}

                <div className={["Ganesh Chaturthi", "Chhath Puja", "Varalakshmi Vratam", "Lohri", "Durga Puja"].includes(themeColors.name) ? "flex flex-col gap-3.5 pb-6" : "grid grid-cols-2 gap-3 pb-6"}>
                  {filteredProducts.map((p) => {
                    const discountPct = Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100);
                    const isExpanded = expandedProductId === p.id;

                    const boutiqueInfo = boutiques.find(b => b.name.toLowerCase() === p.boutique.toLowerCase());
                    const isFes = ["Ganesh Chaturthi", "Chhath Puja", "Varalakshmi Vratam", "Lohri", "Durga Puja"].includes(themeColors.name);

                    if (isFes) {
                      return (
                        <div
                          key={p.id}
                          onClick={() => setExpandedProductId(isExpanded ? null : p.id)}
                          className="border border-[#EFEFEF] overflow-hidden cursor-pointer hover:translate-y-[-2px] transition-transform duration-205 bg-white relative flex flex-col text-left group"
                          style={isExpanded ? { borderColor: themeColors.hexColor, boxShadow: '0 2px 8px rgba(0,0,0,.05)' } : { boxShadow: '0 2px 8px rgba(0,0,0,.04)' }}
                        >
                          {/* Horizontal Layout for the Card */}
                          <div className="flex flex-row p-2.5 gap-3.5">
                            {/* Product/Shop Image */}
                            <div className="relative w-[110px] h-[110px] overflow-hidden bg-slate-50 shrink-0">
                              <img
                                src={p.image}
                                alt={p.name}
                                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                              />
                              <div className="absolute top-1.5 left-1.5 text-white text-[7.5px] font-bold px-1.5 py-0.5 rounded bg-slate-900/60 backdrop-blur-xs z-10 flex items-center gap-0.5">
                                <span>★</span>
                                <span>{p.rating || 4.7}</span>
                              </div>
                            </div>

                            {/* Product/Shop details on the right */}
                            <div className="flex-grow flex flex-col justify-between py-0.5">
                              <div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {boutiqueInfo?.verified && (
                                    <span className="text-[7.5px] font-bold px-1.5 py-0.5 rounded-sm border uppercase leading-none border-emerald-300 text-emerald-600 bg-emerald-50/50">
                                      VERIFIED
                                    </span>
                                  )}
                                  <span className="text-[8.5px] text-gray-500 font-bold flex items-center gap-0.5">
                                    📍 {p.distance <= 1.5 ? '10-15 mins' : p.distance <= 2.5 ? '20-30 mins' : p.distance <= 4.0 ? '1-2 hours' : p.distance <= 6.0 ? '2-3 hours' : 'Same-Day'}
                                  </span>
                                </div>

                                <div className="font-bold text-[12.5px] text-gray-800 leading-tight mt-1">
                                  {p.name}
                                </div>

                                <div className="text-[8.5px] text-gray-500 font-bold mt-0.5 flex items-center gap-0.5">
                                  <span>🏪</span>
                                  <span>{p.boutique}</span>
                                </div>
                              </div>

                              <div className="flex justify-between items-end mt-1.5">
                                <div className="flex flex-col text-left">
                                  {p.originalPrice && (
                                    <span className="text-[8.5px] text-gray-400 line-through font-bold leading-none">
                                      ₹{p.originalPrice}
                                    </span>
                                  )}
                                  <span className="text-[12.5px] font-bold text-gray-900 leading-none mt-0.5">
                                    ₹{p.price} onwards
                                  </span>
                                </div>
                                <div className="text-[8px] font-bold text-emerald-600 flex items-center gap-0.5 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100/60 leading-none">
                                  <span>🚚</span>
                                  <span>{p.deliveryTime}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Expanded Details section */}
                          {isExpanded && (
                            <div className="border-t border-dashed border-gray-150 bg-slate-50/70 p-3 flex flex-col gap-2 animate-in slide-in-from-top-2 duration-250">
                              <p className="text-[10px] text-slate-650 font-medium leading-normal">
                                {p.description}
                              </p>
                              <div className="flex justify-between items-center text-[9px] font-bold text-slate-500 bg-white border border-gray-100 p-2">
                                <span className="flex items-center gap-1">
                                  <span>🚚</span> Delivery: {p.deliveryTime}
                                </span>
                                <span className="flex items-center gap-1">
                                  <span>🛍️</span> Pickup: {p.pickupTime || "15 mins"}
                                </span>
                              </div>
                              <div className="flex gap-2 mt-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedProduct(p);
                                    setStep(2);
                                  }}
                                  className="flex-grow text-white text-[9.5px] font-bold py-2 rounded uppercase tracking-wider text-center shadow-3xs cursor-pointer active:scale-98 transition-all border-none"
                                  style={{ backgroundColor: themeColors.hexColor }}
                                >
                                  View Details & Bargain
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setExpandedProductId(null);
                                  }}
                                  className="px-3.5 border border-gray-300 text-slate-500 hover:bg-slate-100 text-[9.5px] font-bold py-2 rounded uppercase tracking-wider text-center cursor-pointer transition-all bg-white"
                                >
                                  Close
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    }

                    return (
                      <div
                        key={p.id}
                        onClick={() => {
                          setExpandedProductId(isExpanded ? null : p.id);
                        }}
                        className={`cursor-pointer bg-white relative flex flex-col text-left group ${isExpanded ? "col-span-2 border border-gray-200 shadow-sm rounded-sm" : "border border-gray-100 rounded-sm"
                          }`}
                      >
                        {/* Flex layout for expanded vs non-expanded state */}
                        <div className={isExpanded ? "flex flex-row p-2 gap-3" : "flex flex-col"}>
                          {/* Product Image */}
                          <div className={`relative bg-slate-50 shrink-0 ${isExpanded ? "w-[120px] h-[160px]" : "w-full aspect-[3/4]"}`}>
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                            />
                            <div className="absolute bottom-2 left-2 flex items-center gap-0.5 bg-white/80 backdrop-blur-sm text-slate-800 text-[10px] font-bold px-1.5 py-0.5 rounded-sm">
                              <span>{p.rating || 4.7}</span>
                              <span className="text-teal-600 text-[9px]">★</span>
                              <span className="text-gray-400 pl-1 border-l border-gray-300">| 1k</span>
                            </div>
                          </div>

                          {/* Product Details */}
                          <div className={`flex flex-col flex-grow ${isExpanded ? "py-1" : "pt-2 pb-3 px-2"}`}>
                            <div>
                              <div className="font-bold text-[13px] text-[#282c3f] truncate">
                                {p.boutique || p.name.split(" • ")[0]}
                              </div>
                              <div className="text-[11px] text-[#535766] font-normal line-clamp-1 mt-0.5">
                                {p.name}
                              </div>
                            </div>

                            <div className="mt-1.5">
                              <div className="flex items-baseline gap-1 flex-wrap">
                                <span className="text-[13px] font-bold text-[#282c3f]">Rs. {p.price}</span>
                                <span className="text-[11px] text-[#7e818c] line-through">Rs. {p.originalPrice}</span>
                                <span className="text-[11px] font-bold text-[#ff905a]">({discountPct}% OFF)</span>
                              </div>
                            </div>

                            {!isExpanded && (
                              <div className="mt-2 text-[10px] font-bold text-[#535766]">
                                Delivery by <span className="font-bold text-[#282c3f]">{p.deliveryTime}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Expanded Shop Details */}
                        {isExpanded && (
                          <div className="border-t border-dashed border-gray-200 bg-slate-50/70 p-3 flex flex-col gap-2.5 animate-in slide-in-from-top-2 duration-250">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-slate-100 border border-gray-200 flex items-center justify-center font-bold text-[10px] text-gray-600">
                                  {p.boutique.substring(0, 2).toUpperCase()}
                                </div>
                                <div className="flex flex-col text-left">
                                  <span className="font-bold text-[11.5px] text-gray-850 flex items-center gap-1.5">
                                    {p.boutique}
                                    {boutiqueInfo?.verified && (
                                      <span className="bg-emerald-50 border border-emerald-100 text-emerald-600 text-[7px] font-bold uppercase px-1 rounded leading-none">
                                        ✓ Verified
                                      </span>
                                    )}
                                  </span>
                                  <span className="text-[8.5px] text-gray-400 font-bold mt-0.5">
                                    📍 {p.distance <= 1.5 ? '10-15 mins' : p.distance <= 2.5 ? '20-30 mins' : p.distance <= 4.0 ? '1-2 hours' : p.distance <= 6.0 ? '2-3 hours' : 'Same-Day'} • {boutiqueInfo?.speciality || "Festive Collection"}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-0.5 bg-[#2d5a27] text-white text-[8px] font-black px-1.5 py-0.5 rounded-full leading-none">
                                <span>★</span>
                                <span>{boutiqueInfo?.rating || p.rating || 4.7}</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between border-t border-gray-150/40 pt-2 text-[9px] font-extrabold text-slate-600">
                              <span className="flex items-center gap-1">
                                <span>🚚</span> Delivery: {p.deliveryTime}
                              </span>
                              <span className="flex items-center gap-1">
                                <span>🛍️</span> Pickup: {p.pickupTime || "15 mins"}
                              </span>
                            </div>

                            <div className="flex gap-2 mt-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedProduct(p);
                                  setStep(2);
                                }}
                                className="flex-1 bg-[#ff3f6c] hover:bg-[#e02f59] text-white text-[10px] font-black py-2 rounded-lg uppercase tracking-wider text-center shadow-3xs cursor-pointer active:scale-98 transition-all"
                              >
                                View Details & Bargain
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedProductId(null);
                                }}
                                className="px-3 border border-gray-250 text-slate-600 hover:bg-slate-100 text-[10px] font-black py-2 rounded-lg uppercase tracking-wider text-center cursor-pointer transition-all"
                              >
                                Close
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </main>
        </>
      )}

      {/* STEP 2: View Product & Seller Profile */}
      {step === 2 && selectedProduct && (
        <>
          {/* Detailed View header */}
          <header className={`w-full px-3.5 py-3 flex items-center justify-between border-b sticky top-0 z-30 transition-all duration-300 ${themeColors.headerBg}`}>
            <div className="flex items-center gap-2">
              <Link href="/" className="p-1 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </Link>
              <span className={`font-extrabold text-sm tracking-wide ${themeColors.headerText}`}>Apna Bazaar</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setStep(1)} className="p-1 hover:bg-gray-50 rounded-lg cursor-pointer">
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </button>
              <span className="font-extrabold text-sm text-gray-800 tracking-wide">Seller Attire Detail</span>
            </div>
            <div className="flex gap-3">
              <button className="p-1.5 hover:bg-gray-50 rounded-full text-gray-600"><Heart className="w-4.5 h-4.5" /></button>
              <button className="p-1.5 hover:bg-gray-50 rounded-full text-gray-600"><Share2 className="w-4.5 h-4.5" /></button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto pb-24 text-left">
            {/* Product image */}
            <div className="relative w-full h-[320px] bg-slate-50 border-b border-gray-100">
              <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover" />
              <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-xs py-1 px-2.5 rounded-full border border-gray-100 shadow-sm flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-black text-slate-700">Same Day Delivery Eligible</span>
              </div>
            </div>

            {/* Title & Price Header */}
            <div className="px-4 py-4 bg-white border-b border-gray-100 flex flex-col gap-2">
              <h2 className="text-base font-black text-slate-800 tracking-wide leading-snug">{selectedProduct.name}</h2>
              <div className="flex items-baseline gap-2.5">
                <span className="text-xl font-black text-[#ff3f6c]">₹{selectedProduct.price}</span>
                <span className="text-xs text-gray-400 line-through">₹{selectedProduct.originalPrice}</span>
                <span className="text-[9.5px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  {Math.round((1 - selectedProduct.price / selectedProduct.originalPrice) * 100)}% OFF
                </span>
              </div>
            </div>

            {/* Boutique Brand & Verified Status */}
            <div className="px-4 py-3.5 bg-gradient-to-r from-slate-50/50 to-white border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-black text-xs text-[#ff3f6c] border border-gray-200">
                  {selectedProduct.boutique.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] text-gray-400 font-extrabold uppercase tracking-wide">Handmade Sourced By</span>
                  <span className="font-extrabold text-xs text-slate-800 leading-none mt-0.5">{selectedProduct.boutique}</span>
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full flex items-center gap-1 shadow-3xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-[9px] text-emerald-800 font-black uppercase tracking-wider">Artisan Verified</span>
              </div>
            </div>

            {/* Geofence Sourcing Specs */}
            <div className="px-4 py-4 bg-white border-b border-gray-100 flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs font-bold text-gray-600">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#ff3f6c]" />
                  <span>📍 {selectedProduct.distance <= 1.5 ? '10-15 mins' : selectedProduct.distance <= 2.5 ? '20-30 mins' : selectedProduct.distance <= 4.0 ? '1-2 hours' : selectedProduct.distance <= 6.0 ? '2-3 hours' : 'Same-Day'} away</span>
                </div>
                <span>🚚 Delivered within {selectedProduct.deliveryTime}</span>
              </div>

              {/* Progress visual of location geofence */}
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden flex">
                <div className="h-full bg-[#ff3f6c]" style={{ width: `${Math.max(10, 100 - selectedProduct.distance * 8)}%` }} />
              </div>
            </div>

            {/* Artisan Story Badge */}
            <div className="mx-4 mt-4 bg-orange-50/40 border border-orange-100/70 p-3.5 rounded-2xl flex gap-3 text-left">
              <Sparkles className="w-5 h-5 text-orange-500 shrink-0 mt-0.5 animate-pulse" />
              <div className="flex flex-col gap-0.5">
                <span className="text-[9.5px] font-black text-orange-800 uppercase tracking-wide">Weaver / Artisan Bio</span>
                <p className="text-[10.5px] text-orange-950 font-bold leading-relaxed">
                  Support traditional craftsmanship. Handcrafted by local artisans of {selectedProduct.location} using heritage techniques passed down for generations.
                </p>
              </div>
            </div>

            {/* Core Trust Score Matrices */}
            <div className="px-4 py-5 bg-white border-b border-gray-100">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-3">Boutique Trust Metrics</h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50 border border-gray-100 rounded-xl p-3 text-center flex flex-col gap-0.5 shadow-3xs">
                  <span className="text-base font-black text-slate-800 flex items-center justify-center gap-0.5">
                    {selectedProduct.rating} <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                  </span>
                  <span className="text-[8px] font-extrabold text-gray-400 uppercase tracking-tight">Rating</span>
                </div>
                <div className="bg-slate-50 border border-gray-100 rounded-xl p-3 text-center flex flex-col gap-0.5 shadow-3xs">
                  <span className="text-base font-black text-slate-800">{selectedProduct.onTimeDelivery}%</span>
                  <span className="text-[8px] font-extrabold text-gray-400 uppercase tracking-tight">On-Time Speed</span>
                </div>
                <div className="bg-slate-50 border border-gray-100 rounded-xl p-3 text-center flex flex-col gap-0.5 shadow-3xs">
                  <span className="text-base font-black text-slate-800">{selectedProduct.returnRate}%</span>
                  <span className="text-[8px] font-extrabold text-gray-400 uppercase tracking-tight">Return Rate</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="px-4 py-4 bg-white flex flex-col gap-2">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Item Details</h4>
              <p className="text-xs text-gray-600 leading-relaxed leading-normal select-text">
                {selectedProduct.description}
              </p>
            </div>

            {/* More from this Boutique */}
            <div className="px-4 py-5 bg-slate-50/50 border-t border-b border-gray-100 flex flex-col gap-3.5">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-wider">More from {selectedProduct.boutique}</h4>
              <div className="flex gap-3.5 overflow-x-auto pb-1 scrollbar-none w-full justify-start select-none">
                {allProducts
                  .filter(p => p.boutique.toLowerCase() === selectedProduct.boutique.toLowerCase() && p.id !== selectedProduct.id)
                  .map((p) => {
                    const discountPct = Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100);
                    return (
                      <div
                        key={p.id}
                        onClick={() => { setSelectedProduct(p); }}
                        className="w-[136px] shrink-0 border border-gray-200/80 rounded-xl overflow-hidden cursor-pointer hover:shadow-md transition-all bg-white relative flex flex-col text-left group"
                      >
                        <div className="relative w-full h-[100px] bg-slate-50 overflow-hidden">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                          />
                        </div>
                        <div className="p-2 flex-grow flex flex-col justify-between">
                          <div className="font-extrabold text-[10px] text-slate-800 line-clamp-1 leading-snug">
                            {p.name.split(" • ")[0]}
                          </div>
                          <div className="mt-1">
                            <div className="flex items-baseline gap-1 flex-wrap">
                              <span className="text-[10px] font-black text-slate-900">₹{p.price}</span>
                              <span className="text-[7.5px] text-gray-450 line-through font-bold">₹{p.originalPrice}</span>
                            </div>
                            <span className="text-[8px] text-rose-500 font-black">
                              ({discountPct}% OFF)
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </main>

          {/* Checkout Bar */}
          <div className="fixed bottom-14 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3.5 flex gap-3.5 z-40 shadow-[0_-5px_15px_rgba(0,0,0,0.06)]">
            <button
              onClick={() => { setProposedBid(Math.round(selectedProduct.price * 0.81)); setStep(3); }}
              className="flex-1 bg-gradient-to-r from-orange-500 to-[#ff3f6c] hover:from-orange-600 hover:to-[#e0355f] text-white text-xs font-black py-3.5 rounded-xl uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-all active:scale-[0.99]"
            >
              <Sparkles className="w-4 h-4 animate-pulse" /> Request Best Price
            </button>
            <button
              onClick={() => setStep(5)}
              className="flex-1 bg-[#282c3f] hover:bg-[#151722] text-white text-xs font-black py-3.5 rounded-xl uppercase tracking-wider shadow-md cursor-pointer transition-all active:scale-[0.99]"
            >
              Buy Now
            </button>
          </div>
        </>
      )}

      {/* STEP 3: Bargain Best Price (Interactive Slider & Gauge) */}
      {step === 3 && selectedProduct && (
        <>
          <header className={`w-full px-3.5 py-3 flex items-center justify-between border-b sticky top-0 z-30 transition-all duration-300 ${themeColors.headerBg}`}>
            <div className="flex items-center gap-2">
              <Link href="/" className="p-1 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </Link>
              <span className={`font-extrabold text-sm tracking-wide ${themeColors.headerText}`}>Apna Bazaar</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setStep(2)} className="p-1 hover:bg-gray-50 rounded-lg cursor-pointer">
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </button>
              <span className="font-extrabold text-sm text-gray-800 tracking-wide">Propose Bargain Price</span>
            </div>
            <span className="text-[10px] text-[#ff3f6c] font-black uppercase bg-pink-50 border border-pink-100 px-2.5 py-0.5 rounded shadow-3xs">Bargain Round</span>
          </header>

          <main className="flex-1 px-4 py-6 flex flex-col gap-6 text-center">

            {/* Price comparisons */}
            <div className="flex justify-around items-center border border-gray-100 rounded-2xl p-4 bg-white shadow-3xs">
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Standard Price</span>
                <span className="text-base font-black text-slate-400 line-through">₹{selectedProduct.price}</span>
              </div>
              <div className="w-[1px] h-8 bg-gray-100" />
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Proposed Bargain</span>
                <span className="text-xl font-black text-[#ff3f6c]">₹{proposedBid}</span>
              </div>
            </div>

            {/* Custom SVG likelihood gauge */}
            <div className="flex flex-col items-center gap-2 bg-slate-50 border border-gray-100 rounded-2xl p-4">
              <span className="text-[9.5px] font-black text-gray-400 uppercase tracking-wider">Likelihood Meter</span>

              {/* Gauge Arc (Only contains the SVG) */}
              <div className="relative w-44 h-[88px] flex items-end justify-center">
                <svg className="w-full h-full" viewBox="0 0 100 50">
                  <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#e2e8f0" strokeWidth="8" strokeLinecap="round" />
                  {/* Colored segments */}
                  <path d="M 10 50 A 40 40 0 0 1 36 24" fill="none" stroke="#ef4444" strokeWidth="8" />
                  <path d="M 36 24 A 40 40 0 0 1 64 24" fill="none" stroke="#eab308" strokeWidth="8" />
                  <path d="M 64 24 A 40 40 0 0 1 90 50" fill="none" stroke="#10b981" strokeWidth="8" />

                  {/* Needle line */}
                  <line
                    x1="50"
                    y1="50"
                    x2={`${50 + 36 * Math.cos((180 - (probInfo.percentage / 100) * 180) * Math.PI / 180)}`}
                    y2={`${50 - 36 * Math.sin((180 - (probInfo.percentage / 100) * 180) * Math.PI / 180)}`}
                    stroke="#1e293b"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    className="transition-all duration-300 ease-out"
                  />
                  <circle cx="50" cy="50" r="5" fill="#1e293b" />
                </svg>
              </div>

              {/* Labels displayed clearly below the gauge (No overlap!) */}
              <div className="text-center flex flex-col items-center">
                <span className={`text-xs font-black uppercase tracking-wider ${probInfo.color}`}>{probInfo.label}</span>
                <span className="text-[10px] text-gray-500 font-bold mt-0.5">{probInfo.percentage}% Acceptance Probability</span>
              </div>

              {/* Note text below meter */}
              <p className="text-[10px] text-gray-500 font-bold border-t border-gray-150/50 pt-2 w-full text-center leading-normal">
                💡 {probInfo.note}
              </p>
            </div>

            {/* Slider control */}
            <div className="flex flex-col gap-4 bg-white border border-gray-100 rounded-2xl p-4 shadow-3xs">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block text-left">Slide Your Bid offer</span>
              <input
                type="range"
                min={Math.round(selectedProduct.price * 0.7)} // Minimum limit 70% of list price
                max={selectedProduct.price}
                value={proposedBid}
                onChange={(e) => setProposedBid(Number(e.target.value))}
                className="w-full accent-[#ff3f6c] cursor-pointer"
              />

              <div className="flex justify-between text-[10px] font-bold text-gray-400">
                <div className="flex flex-col items-start">
                  <span className="text-red-500 font-extrabold">₹{Math.round(selectedProduct.price * 0.7)}</span>
                  <span>Min limit</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-amber-500 font-extrabold">₹{Math.round(selectedProduct.price * 0.85)}</span>
                  <span>Fair limit</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-emerald-500 font-extrabold">₹{selectedProduct.price}</span>
                  <span>Listed price</span>
                </div>
              </div>
            </div>

          </main>

          {/* Offer confirmation CTA */}
          <div className="fixed bottom-14 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3.5 flex z-40 shadow-[0_-5px_15px_rgba(0,0,0,0.06)]">
            <button
              onClick={handleSubmitOffer}
              className="w-full bg-[#ff3f6c] hover:bg-[#e0355f] text-white text-xs font-black py-3.5 rounded-xl uppercase tracking-wider shadow-md cursor-pointer transition-all active:scale-[0.99] text-center"
            >
              Propose & Chat
            </button>
          </div>
        </>
      )}

      {/* STEP 4: Negotiate with Shop (API-driven conversation) */}
      {step === 4 && selectedProduct && (
        <>
          {/* Conversational chat header */}
          <header className="w-full bg-white px-3.5 py-2.5 flex items-center justify-between border-b border-gray-100 sticky top-0 z-30 shadow-3xs">
            <div className="flex items-center gap-3">
              <button onClick={() => setStep(3)} className="p-1 hover:bg-gray-50 rounded-lg cursor-pointer">
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </button>
              <div className="w-8 h-8 rounded-full bg-orange-50 border border-orange-100 text-orange-700 font-black text-xs flex items-center justify-center shadow-3xs">
                {selectedProduct.boutique.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex flex-col text-left">
                <span className="font-black text-xs text-slate-800 leading-none">{selectedProduct.boutique}</span>
                {isTyping ? (
                  <span className="text-[9px] text-[#ff3f6c] font-black animate-pulse mt-0.5">Typing counter proposal...</span>
                ) : (
                  <span className="text-[9px] text-emerald-500 font-black tracking-wide mt-0.5">Active now</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4 text-gray-500 pr-1">
              <Phone className="w-4 h-4 cursor-pointer hover:text-[#ff3f6c]" />
              <MoreVertical className="w-4 h-4 cursor-pointer hover:text-[#ff3f6c]" />
            </div>
          </header>

          {/* Chat message space */}
          <main className="flex-1 overflow-y-auto px-4 py-4 bg-[#f8f9fa] flex flex-col gap-4 select-text">
            <div className="text-[8.5px] text-gray-400 font-bold text-center uppercase tracking-wider select-none py-1 border-b border-gray-200/50">
              Artisan Bargain Session
            </div>

            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2 max-w-[85%] items-end ${msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                  }`}
              >
                <div className={`p-3 rounded-2xl text-[11px] leading-normal font-semibold shadow-3xs ${msg.sender === "user"
                  ? "bg-[#ff3f6c] text-white rounded-br-none"
                  : "bg-white border border-gray-150 text-slate-800 rounded-bl-none"
                  }`}>
                  {msg.text}
                </div>
                <span className="text-[7px] text-gray-400 font-bold select-none shrink-0 mb-1">{msg.time}</span>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2 mr-auto items-center">
                <div className="bg-white border border-gray-150 p-3 rounded-2xl rounded-bl-none flex items-center gap-1.5 shadow-3xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
          </main>

          {/* Negotiating Controls Panel */}
          <div className="fixed bottom-14 left-0 right-0 bg-white border-t border-gray-100 p-3 flex flex-col gap-2.5 z-40 shadow-[0_-5px_15px_rgba(0,0,0,0.06)]">

            {/* Quick Action buttons representing bids */}
            {!isTyping && chatMessages.length > 0 && chatMessages[chatMessages.length - 1].sender === "shop" && (
              <div className="flex gap-2 text-xs">
                <button
                  onClick={() => handleAcceptCounter(negotiatedPrice)}
                  className="flex-1 bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 text-emerald-800 text-[10px] font-black py-2.5 rounded-xl uppercase tracking-wider cursor-pointer transition-colors"
                >
                  Accept Offer (₹{negotiatedPrice})
                </button>
                {chatRound < 2 && (
                  <button
                    onClick={() => handleUserCounterBid(Math.round((proposedBid + negotiatedPrice) / 2))}
                    className="flex-1 bg-[#282c3f] hover:bg-[#151722] text-white text-[10px] font-black py-2.5 rounded-xl uppercase tracking-wider cursor-pointer transition-colors"
                  >
                    Counter ₹{Math.round((proposedBid + negotiatedPrice) / 2)}
                  </button>
                )}
                <button
                  onClick={() => {
                    setChatMessages(prev => [...prev, { sender: "shop", text: "Offer canceled. Redirecting you to catalog...", time: "now" }]);
                    setTimeout(() => setStep(1), 1500);
                  }}
                  className="bg-red-50 border border-red-100 text-red-700 hover:bg-red-100 text-[10px] font-black px-3.5 py-2.5 rounded-xl uppercase tracking-wider cursor-pointer"
                >
                  Reject
                </button>
              </div>
            )}

            {/* Text message bar */}
            <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3.5 py-2.5 bg-gray-50 focus-within:bg-white focus-within:border-gray-300 transition-colors">
              <input
                type="text"
                placeholder="Type counter offer amount (e.g. 1100)..."
                value={userChatInput}
                onChange={(e) => setUserChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendFreeChatMessage()}
                className="flex-1 bg-transparent border-none outline-none text-xs text-gray-700 placeholder-gray-400"
              />
              <button
                onClick={handleSendFreeChatMessage}
                className="text-[#ff3f6c] p-0.5 hover:scale-105 transition-transform cursor-pointer shrink-0"
              >
                <Send className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>
        </>
      )}

      {/* STEP 5: Choose Fulfillment */}
      {step === 5 && selectedProduct && (
        <>
          <header className={`w-full px-3.5 py-3 flex items-center justify-between border-b sticky top-0 z-30 transition-all duration-300 ${themeColors.headerBg}`}>
            <div className="flex items-center gap-2">
              <Link href="/" className="p-1 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </Link>
              <span className={`font-extrabold text-sm tracking-wide ${themeColors.headerText}`}>Apna Bazaar</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setStep(2)} className="p-1 hover:bg-gray-50 rounded-lg cursor-pointer">
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </button>
              <span className="font-extrabold text-sm text-gray-800 tracking-wide">Fulfillment Option</span>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 flex flex-col gap-5 text-left">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Boutique Delivery</h3>

            {/* Same day delivery option */}
            <div
              onClick={() => setFulfillmentMode("delivery")}
              className={`border rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all ${fulfillmentMode === "delivery"
                ? "border-[#ff3f6c] bg-pink-50/20 shadow-3xs"
                : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
                }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center shrink-0 ${fulfillmentMode === "delivery" ? "border-[#ff3f6c]" : "border-gray-300"
                  }`}>
                  {fulfillmentMode === "delivery" && <span className="w-2.5 h-2.5 rounded-full bg-[#ff3f6c]"></span>}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-black text-slate-800">Delivered within {selectedProduct.deliveryTime}</span>
                  <span className="text-[9.5px] text-gray-400 mt-0.5">Sourced from {selectedProduct.boutique} ({selectedProduct.distance <= 1.5 ? '10-15 mins' : selectedProduct.distance <= 2.5 ? '20-30 mins' : selectedProduct.distance <= 4.0 ? '1-2 hours' : selectedProduct.distance <= 6.0 ? '2-3 hours' : 'Same-Day'})</span>
                </div>
              </div>
              <span className="text-xs font-black text-slate-800">₹49</span>
            </div>

            {/* Boutique store pickup option */}
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-wider mt-2">Local Shop Pick-up</h3>
            <div
              onClick={() => setFulfillmentMode("pickup")}
              className={`border rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all ${fulfillmentMode === "pickup"
                ? "border-[#ff3f6c] bg-pink-50/20 shadow-3xs"
                : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
                }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center shrink-0 ${fulfillmentMode === "pickup" ? "border-[#ff3f6c]" : "border-gray-300"
                  }`}>
                  {fulfillmentMode === "pickup" && <span className="w-2.5 h-2.5 rounded-full bg-[#ff3f6c]"></span>}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-black text-slate-800">Pickup in {selectedProduct.pickupTime}</span>
                  <span className="text-[9.5px] text-gray-400 mt-0.5">Reserve online, pay & pick up from local boutique counter</span>
                </div>
              </div>
              <span className="text-xs font-black text-emerald-600 uppercase tracking-wider">Free</span>
            </div>

            {/* Tailoring toggle block */}
            <div className="bg-emerald-50/30 border border-emerald-100 rounded-2xl p-4 flex justify-between items-center mt-3">
              <div className="flex flex-col text-left gap-0.5">
                <span className="text-xs font-black text-emerald-800 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Custom Tailoring Available
                </span>
                <span className="text-[9.5px] text-emerald-700">Add tailoring instructions to fit your profile mannequin.</span>
              </div>
              <button
                onClick={() => alert("Mannequin details synced! Tailoring will be adjusted to your profile sizes.")}
                className="bg-emerald-600 text-white text-[9.5px] font-black py-1.5 px-3 rounded-lg shadow-sm"
              >
                Apply Fits
              </button>
            </div>

            <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-3 flex items-center gap-2 mt-1">
              <Clock className="w-4 h-4 text-orange-500 shrink-0" />
              <span className="text-[9.5px] text-orange-800 font-bold leading-tight">
                Order within next 30 mins to guarantee on-time delivery schedule!
              </span>
            </div>
          </main>

          {/* Place order CTA */}
          <div className="fixed bottom-14 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3.5 flex z-40 shadow-[0_-5px_15px_rgba(0,0,0,0.06)]">
            <button
              onClick={() => setStep(6)}
              className="w-full bg-[#ff3f6c] hover:bg-[#e0355f] text-white text-xs font-black py-3.5 rounded-xl uppercase tracking-wider shadow-md cursor-pointer transition-all active:scale-[0.99] text-center"
            >
              Confirm Order & Pay
            </button>
          </div>
        </>
      )}

      {/* STEP 6: Save or Share Deal */}
      {step === 6 && selectedProduct && (
        <main className="flex-1 px-4 py-16 flex flex-col gap-6 text-center justify-center items-center">
          <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center text-emerald-500 shadow-md animate-bounce">
            <CheckCircle className="w-9 h-9" strokeWidth={2.5} />
          </div>

          <div className="flex flex-col gap-1.5">
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-wide">Bargain Secured!</h2>
            <p className="text-sm text-gray-500 font-bold">
              Purchased {selectedProduct.name} at <span className="text-[#ff3f6c] font-black">₹{negotiatedPrice}</span>
            </p>
            <span className="text-[9.5px] font-black text-gray-400 uppercase tracking-widest mt-1">Order Ref: MYN-LB-{(Math.random() * 1000000).toFixed(0)}</span>
          </div>

          <div className="w-full max-w-xs flex flex-col gap-3.5 mt-6">
            <button
              onClick={() => { alert("Shared to Outfit Circle group board!"); setStep(1); }}
              className="bg-[#ff3f6c] hover:bg-[#e0355f] text-white text-xs font-black py-3.5 rounded-xl uppercase tracking-wider shadow-md cursor-pointer transition-all active:scale-[0.99]"
            >
              Share Deal to Outfit Circle
            </button>

            <button
              onClick={() => setStep(1)}
              className="bg-white border border-gray-200 text-slate-700 hover:bg-gray-50 text-xs font-black py-3.5 rounded-xl uppercase tracking-wider shadow-3xs cursor-pointer transition-colors"
            >
              Return to Apna Bazaar
            </button>
          </div>
        </main>
      )}
      {/* Floating Ambient Music Control for Chhath Puja / Varalakshmi Vratam */}
      {(themeColors.name === "Chhath Puja" || themeColors.name === "Varalakshmi Vratam") && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2">
          {/* Tooltip */}
          {showMusicTooltip && (
            <div className="bg-slate-900/90 text-white text-[9px] font-bold px-2.5 py-1.5 rounded-lg shadow-md whitespace-nowrap animate-in fade-in slide-in-from-bottom-2 duration-200">
              🎵 {themeColors.name === "Varalakshmi Vratam" ? "Varalakshmi" : "Chhath"} Ambience
            </div>
          )}

          {/* Floating Glass Control Button */}
          <div className="relative">
            <button
              onClick={togglePlayPause}
              onMouseEnter={() => setShowMusicTooltip(true)}
              onMouseLeave={() => setShowMusicTooltip(false)}
              aria-label={`Toggle ${themeColors.name} background ambience music`}
              className={`w-10 h-10 rounded-full bg-white/80 backdrop-blur-md border flex items-center justify-center shadow-lg transition-all duration-300 relative cursor-pointer ${themeColors.name === "Varalakshmi Vratam"
                ? (isMusicPlaying ? "scale-105 border-purple-300 shadow-purple-100" : "border-purple-100")
                : (isMusicPlaying ? "scale-105 border-orange-300 shadow-orange-100" : "border-orange-100")
                }`}
            >
              {/* Glowing Pulse Ring */}
              {isMusicPlaying && (
                <span className={`absolute inset-0 rounded-full animate-ping ${themeColors.name === "Varalakshmi Vratam" ? "bg-purple-400/25" : "bg-orange-400/25"
                  }`} />
              )}

              <span className="text-sm select-none">
                {isMusicPlaying ? "🔊" : "🔇"}
              </span>
            </button>

            {/* Micro mute toggle */}
            {isMusicPlaying && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMute();
                }}
                title={isMusicMuted ? "Unmute" : "Mute"}
                className={`absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full border border-white text-white text-[8px] font-black flex items-center justify-center shadow-sm cursor-pointer ${themeColors.name === "Varalakshmi Vratam"
                  ? "bg-purple-600 hover:bg-purple-700"
                  : "bg-orange-500 hover:bg-orange-600"
                  }`}
              >
                {isMusicMuted ? "🔇" : "🔊"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
