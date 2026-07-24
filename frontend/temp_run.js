var getLocalBazaarData = function (city) {
    var normCity = city.trim().toLowerCase();
    if (normCity === "vizag" || normCity === "vijayawada") {
        var generatedBoutiques_1 = [
            { id: "b_vratam_1", name: "Sri Lakshmi Pooja Stores", rating: 4.8, distance: 1.2, speciality: "Puja Samagri • Sarees • Prasad Decors • Flowers • Decorations & More", verified: true, x: 42, y: 38 },
            { id: "b_vratam_2", name: "Venkateshwara Saree House", rating: 4.7, distance: 2.1, speciality: "Traditional Sarees • Blouses • Readymades • Pattu & Silk Sarees", verified: true, x: 62, y: 32 },
            { id: "b_vratam_3", name: "Pushpa Flowers & Garlands", rating: 4.6, distance: 3.3, speciality: "Fresh Jasmine • Marigold Garlands • Pooja Flowers", verified: true, x: 28, y: 62 }
        ];
        var generatedProducts_1 = [
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
        return { boutiques: generatedBoutiques_1, products: generatedProducts_1 };
    }
    if (normCity === "amritsar" || normCity === "ludhiana") {
        var generatedBoutiques_2 = [
            { id: "b_lohri_1", name: "Bittu Lohri Store", rating: 4.8, distance: 1.2, speciality: "Kurta Pajama • Phulkari • Accessories • Jutis & More", verified: true, x: 42, y: 38 },
            { id: "b_lohri_2", name: "Punjab Phulkari House", rating: 4.7, distance: 2.3, speciality: "Phulkari Dupatta • Suits • Stoles • Salwar Kameez", verified: true, x: 62, y: 30 },
            { id: "b_lohri_3", name: "Punjab Jutti House", rating: 4.6, distance: 2.6, speciality: "Handcrafted Juttis • Leather Footwear • Punjabi Mojaris", verified: true, x: 28, y: 62 }
        ];
        var generatedProducts_2 = [
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
        return { boutiques: generatedBoutiques_2, products: generatedProducts_2 };
    }
    if (normCity === "patna") {
        var generatedBoutiques_3 = [
            { id: "b_chhath_1", name: "Maa Ganga Pooja Bhandar", rating: 4.8, distance: 1.2, speciality: "Puja Samagri • Brass Urns • Diyas • Traditional Wear", verified: true, x: 40, y: 40 },
            { id: "b_chhath_2", name: "Mithila Handlooms & Sarees", rating: 4.7, distance: 1.8, speciality: "Dhakai Jamdani • Bhagalpuri Silk • Sarees", verified: true, x: 60, y: 35 },
            { id: "b_chhath_3", name: "Ganga Khadi Bhandar", rating: 4.6, distance: 2.5, speciality: "Khadi Kurtas • Nehru Jackets • Handloom Dhoti", verified: true, x: 30, y: 65 }
        ];
        var generatedProducts_3 = [
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
        return { boutiques: generatedBoutiques_3, products: generatedProducts_3 };
    }
    if (normCity === "belgaum" || normCity === "mumbai") {
        var generatedBoutiques_4 = [
            { id: "b_ganesh_1", name: "Shree Ganesh Pooja Bhandar", rating: 4.7, distance: 1.2, speciality: "Puja Samagri • Idols • Decor • More", verified: true, x: 42, y: 38 },
            { id: "b_ganesh_2", name: "Sai Decor & Events", rating: 4.6, distance: 2.1, speciality: "Decorations • Torans • Lights • Backdrops", verified: true, x: 62, y: 32 },
            { id: "b_ganesh_3", name: "Mumbai Mojari House", rating: 4.5, distance: 2.6, speciality: "Handcrafted Juttis • Mojaris • Kolhapuris • Sandals", verified: true, x: 28, y: 62 }
        ];
        var generatedProducts_4 = [
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
        return { boutiques: generatedBoutiques_4, products: generatedProducts_4 };
    }
    if (normCity === "kolkata") {
        var generatedBoutiques_5 = [
            { id: "b_durga_1", name: "Kumartuli Puja Market", rating: 4.8, distance: 1.3, speciality: "Eco-friendly Clay Idols • Pujo Thali • Dhunuchi Set • Lights", verified: true, x: 42, y: 38 },
            { id: "b_durga_2", name: "Kalighat Handlooms", rating: 4.7, distance: 2.2, speciality: "Lal Paar Sarees • Dhakai Jamdanis • Baluchari Silk • Kurta", verified: true, x: 62, y: 32 },
            { id: "b_durga_3", name: "Nababarsha Gifts & Decor", rating: 4.6, distance: 3.5, speciality: "Festive Shola Flowers • Conch Shells • Gifts • Garlands", verified: true, x: 28, y: 62 }
        ];
        var generatedProducts_5 = [
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
        return { boutiques: generatedBoutiques_5, products: generatedProducts_5 };
    }
    var theme = {
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
    }
    else if (["vizag", "vijayawada", "mysuru"].includes(normCity)) {
        theme = {
            speciality: "Varalakshmi Vratam Silk",
            clothing: ["Varalakshmi Silk Saree", "Kanchipuram Silk Pattu Pavadai", "Pure Silk Brocade Kurta"],
            accessories: ["Antique Gold Lakshmi Necklace", "Pooja Kalasam Decor", "Brass Vratam Thali Set"],
            boutiques: ["Mysore Silk Emporium", "Vizag Royal Pattu", "Vijayawada Handlooms"]
        };
    }
    else if (["coimbatore", "madurai", "salem"].includes(normCity)) {
        theme = {
            speciality: "Tamil Nadu Aadi Weaves",
            clothing: ["Pure Kanchipuram Silk Saree", "Coimbatore Cotton Saree", "South Indian Festive Veshti Kurta"],
            accessories: ["Gold-plated Temple Haram", "Fresh Jasmine Flower Garland", "Traditional Brass Vilakku Decor"],
            boutiques: ["Kovai Silk House", "Madurai Handlooms", "Aadi Heritage Silks"]
        };
    }
    else if (["belgaum", "mumbai"].includes(normCity)) {
        theme = {
            speciality: "Ganesh Chaturthi Traditional Silk",
            clothing: ["Pure Silk Paithani Saree", "Ganesh Chaturthi Cotton Kurta", "Traditional Dhoti & Silk Kurta Set"],
            accessories: ["Golden Ganesha Pendant & Mala", "Modak Puja Serving Platter", "Traditional Brass Diya Set"],
            boutiques: normCity === "mumbai"
                ? ["Lalbaug Festival Attires", "Dadar Handloom House", "Mumbai Ganesh Emporium"]
                : ["Karnataka Silk Emporium", "Belgaum Handlooms", "Ganesha Royal Attires"]
        };
    }
    else if (["amritsar", "ludhiana"].includes(normCity)) {
        theme = {
            speciality: "Lohri Punjabi Phulkari",
            clothing: ["Traditional Phulkari Salwar Suit", "Lohri Festival Punjabi Kurta", "Heavy Embroidered Punjabi Dupatta"],
            accessories: ["Phulkari Juttis & Mojris", "Traditional Punjabi Parandi", "Lohri Sweets & Til Gift Box"],
            boutiques: ["Amritsar Phulkari Palace", "Ludhiana Heritage Weaves", "Punjab Festive Attire"]
        };
    }
    else if (normCity === "kolkata") {
        theme = {
            speciality: "Durga Puja Lal Paar Saree & Handloom",
            clothing: ["Traditional Lal Paar Saree", "Bengali Dhakai Jamdani Saree", "Kolkata Hand-woven Kurta"],
            accessories: ["Shakha Pola Bangles Set", "Designer Zardozi Potli Bag", "Durga Puja Conch Shell Decor"],
            boutiques: ["Kalighat Weaves", "Howrah Handloom Emporium", "Bengal Royal Heritage"]
        };
    }
    else if (normCity === "guwahati") {
        theme = {
            speciality: "Rongali Bihu Mekhela Chador",
            clothing: ["Muga Silk Mekhela Chador", "Traditional Bihu Assamese Kurta", "Eri Silk Hand-woven Shawl"],
            accessories: ["Traditional Assamese Gamusa", "Assamese Jaapi Decor Hat", "Bihu Festive Brass Bangles"],
            boutiques: ["Assam Handloom Co-op", "Brahmaputra Heritage", "Pragjyotish Handloom House"]
        };
    }
    // Generate 6 boutiques based on theme
    var generatedBoutiques = [
        { id: "b_1", name: theme.boutiques[0] || "".concat(city, " Weaves"), rating: 4.8, distance: 1.5, speciality: theme.speciality, verified: true, x: 38, y: 35 },
        { id: "b_2", name: theme.boutiques[1] || "".concat(city, " Craft House"), rating: 4.6, distance: 2.8, speciality: theme.speciality, verified: true, x: 62, y: 28 },
        { id: "b_3", name: theme.boutiques[2] || "".concat(city, " Heritage Emporium"), rating: 4.5, distance: 3.4, speciality: theme.speciality, verified: false, x: 25, y: 65 },
        { id: "b_4", name: "Metro Craft Co.", rating: 4.4, distance: 4.1, speciality: "Festive Generalists", verified: true, x: 45, y: 48 },
        { id: "b_5", name: "Heritage Attire House", rating: 4.7, distance: 4.9, speciality: "Premium Traditional", verified: true, x: 55, y: 60 },
        { id: "b_6", name: "Weaves of India Co.", rating: 4.6, distance: 5.8, speciality: "Handloom Traditional", verified: true, x: 70, y: 55 }
    ];
    // Generate products using clothing & accessories
    var generatedProducts = [];
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
    }
    else {
        // Add Clothing products
        theme.clothing.forEach(function (clothingName, index) {
            generatedProducts.push({
                id: "cloth_".concat(index),
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
                description: "Beautiful hand-crafted ".concat(clothingName, " designed for traditional and festive celebrations.")
            });
        });
        // Add Accessories products
        theme.accessories.forEach(function (accName, index) {
            generatedProducts.push({
                id: "acc_".concat(index),
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
                description: "Elegant traditional ".concat(accName, " to pair beautifully with your festive outfits.")
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
var getCityState = function (city) {
    var norm = city.trim().toLowerCase();
    if (["belgaum", "mysuru"].includes(norm))
        return "Karnataka";
    if (["vijayawada", "vizag"].includes(norm))
        return "Andhra Pradesh";
    if (norm === "mumbai")
        return "Maharashtra";
    if (norm === "patna")
        return "Bihar";
    if (["amritsar", "ludhiana"].includes(norm))
        return "Punjab";
    if (norm === "kolkata")
        return "West Bengal";
    if (norm === "guwahati")
        return "Assam";
    return "Tamil Nadu";
};
// Dynamic local bazaar color/theme generator based on local festival
// Dynamic local bazaar color/theme generator based on local festival
// Dynamic local bazaar color/theme generator based on local festival
var getFestiveTheme = function (festivalName) {
    var norm = festivalName.trim().toLowerCase();
    // Base default values
    var name = "General Festive";
    var hexColor = "#ff3f6c"; // default Myntra pink accent
    var bannerTitle = "Explore Local Sellers with ";
    var bannerHighlight = "Trust";
    var bannerDesc = "Handcrafted accessories, direct handlooms, and traditional clothing.";
    var bannerImg = "/aadi_bazaar_banner.png";
    var bannerBtn = "Explore Collections";
    var bannerBadge = "Bazaar Special";
    var bannerTag = "✨ SUPPORT LOCAL ARTISANS";
    var categories = [
        { name: "All", img: null, value: "All" },
        { name: "Sarees", img: "/ethnic_wear_category.png", value: "Ethnic Wear" },
        { name: "Jewellery", img: "/jewellery_category.png", value: "Jewellery" },
        { name: "Footwear", img: "/traditional_food_category.png", value: "Footwear" },
        { name: "Miscellaneous", img: "/pooja_essentials_category.png", value: "Miscellaneous" }
    ];
    var festiveBanner = "bg-gradient-to-r from-[#ff3f6c] to-[#e0355f] text-white";
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
    }
    else if (norm === "chhath puja") {
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
    }
    else if (norm === "varalakshmi vratam") {
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
    }
    else if (norm === "ganesh chaturthi") {
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
    }
    else if (norm === "lohri") {
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
    }
    else if (norm === "durga puja") {
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
        name: name,
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
        accentText: "text-[".concat(hexColor, "]"),
        badgeBg: "bg-[".concat(hexColor, "]"),
        mapCircle: "bg-gray-400/5 border-gray-400/20",
        festiveBanner: festiveBanner,
        hexColor: hexColor,
        bannerTitle: bannerTitle,
        bannerHighlight: bannerHighlight,
        bannerDesc: bannerDesc,
        bannerImg: bannerImg,
        bannerBtn: bannerBtn,
        bannerBadge: bannerBadge,
        bannerTag: bannerTag,
        categories: categories
    };
};
var output = {};
for (var _i = 0, _a = ["vizag", "amritsar", "kolkata", "guwahati", "patna"]; _i < _a.length; _i++) {
    var city = _a[_i];
    output[city] = getLocalBazaarData(city);
}
console.log(JSON.stringify(output, null, 2));
