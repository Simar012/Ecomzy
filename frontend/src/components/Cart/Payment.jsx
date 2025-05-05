import axios from 'axios';
import { newOrder, emptyCart } from '../../actions/orderAction'
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PriceSidebar from './PriceSidebar';
import Stepper from './Stepper';

import {
    CardNumberElement,
    CardCvcElement,
    CardExpiryElement,
    useStripe,
    useElements,
} from '@stripe/react-stripe-js';
import { clearErrors } from '../../actions/orderAction';
import { useSnackbar } from 'notistack';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import MetaData from '../Layouts/MetaData';
import { useNavigate } from 'react-router-dom';
const Payment = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { enqueueSnackbar } = useSnackbar();
    const stripe = useStripe();
    const elements = useElements();

    const [payDisable, setPayDisable] = useState(false);

    const { shippingInfo, cartItems } = useSelector((state) => state.cart);
    const { user } = useSelector((state) => state.user);
    const { error } = useSelector((state) => state.newOrder);

    const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // const paymentData = {
    //     amount: Math.round(totalPrice),
    //     email: user.email,
    //     phoneNo: shippingInfo.phoneNo,
    // };

    const submitHandler = async (e) => {
        e.preventDefault();
        setPayDisable(true);

        // Check if user is logged in
        if (!user) {
            enqueueSnackbar("Please log in to proceed with the payment.", { variant: "error" });
            navigate("/login");
            return;
        }

        // Check if shipping info exists
        if (!shippingInfo) {
            enqueueSnackbar("Shipping information is missing.", { variant: "error" });
            return;
        }
        const paymentData = {
            amount: Math.round(totalPrice),
            email: user.email,
            phoneNo: shippingInfo.phoneNo,
        };
        
        try {
            const config = {
                headers: {
                    "Content-Type": "application/json",
                },
            };

            const { data } = await axios.post(
                'https://ecomzy-backend-nfkl.onrender.com/api/v1/payment/process',
                paymentData,
                config,
            );

            const client_secret = data.client_secret;

            // Confirm the payment with Stripe
            if (!stripe || !elements) return;

            const result = await stripe.confirmCardPayment(client_secret, {
                payment_method: {
                    card: elements.getElement(CardNumberElement),
                    billing_details: {
                        name: user.name,
                        email: user.email,
                        address: {
                            line1: shippingInfo.address,
                            city: shippingInfo.city,
                            country: shippingInfo.country,
                            state: shippingInfo.state,
                            postal_code: shippingInfo.pincode,
                        },
                    },
                },
            });

            if (result.error) {
                setPayDisable(false);
                enqueueSnackbar(result.error.message, { variant: "error" });
            } else {
                if (result.paymentIntent.status === "succeeded") {

                    // Add payment info to order
                    const order = {
                        shippingInfo,
                        orderItems: cartItems,
                        totalPrice,
                        paymentInfo: {
                            id: result.paymentIntent.id,
                            status: result.paymentIntent.status,
                        },
                    };

                    dispatch(newOrder(order)); // Dispatch your order action here
                    dispatch(emptyCart()); // Dispatch your empty cart action here

                    // Redirect to success page
                    navigate("/order/success");
                } else {
                    enqueueSnackbar("Payment failed", { variant: "error" });
                }
            }
        } catch (error) {
            setPayDisable(false);
            enqueueSnackbar(error, { variant: "error" });
        }
    };

    useEffect(() => {
        if (error) {
            dispatch(clearErrors());
            enqueueSnackbar(error, { variant: "error" });
        }
    }, [dispatch, error, enqueueSnackbar]);

    // const options = { // for removing autolink of stripe
    //     style: {
    //       base: {
    //         fontSize: '16px',
    //         color: '#32325d',
    //         '::placeholder': {
    //           color: '#aab7c4',
    //         },
    //       },
    //       invalid: {
    //         color: '#fa755a',
    //       },
    //     },
    //   };

    return (
        <>
            <MetaData title="Ecomzy: Secure Payment | Stripe" />

            <main className="w-full mt-20">
                <div className="flex flex-col sm:flex-row gap-3.5 w-full sm:w-11/12 mt-0 sm:mt-4 m-auto sm:mb-7">

                    <div className="flex-1">
                        <Stepper activeStep={3}>
                            <div className="w-full bg-white">

                                <form onSubmit={(e) => submitHandler(e)} autoComplete="off" className="flex flex-col justify-start gap-2 w-full mx-8 my-4 overflow-hidden">
                                    <FormControl>
                                        <RadioGroup
                                            aria-labelledby="payment-radio-group"
                                            defaultValue="stripe"
                                            name="payment-radio-button"
                                        >
                                            <FormControlLabel
                                                value="stripe"
                                                control={<Radio />}
                                                label={
                                                    <div className="flex items-center gap-4">
                                                        <img draggable="false" className="h-6 w-14 object-contain" src="//upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Stripe_Logo%2C_revised_2016.svg/512px-Stripe_Logo%2C_revised_2016.svg.png" alt="Stripe" />
                                                    </div>
                                                }
                                            />
                                        </RadioGroup>
                                    </FormControl>

                                    {/* Stripe Form Elements */}
                                    <div>
                                        <CardNumberElement />
                                    </div>
                                    <div>
                                        <CardExpiryElement />
                                    </div>
                                    <div>
                                        <CardCvcElement />
                                    </div>
                                    
                                    <input type="submit" value={`Pay ₹${totalPrice.toLocaleString()}`} disabled={payDisable ? true : false} className={`${payDisable ? "bg-primary-grey cursor-not-allowed" : "bg-primary-orange cursor-pointer"} w-1/2 sm:w-1/4 my-2 py-3 font-medium text-white shadow hover:shadow-lg rounded-sm uppercase outline-none`} />
                                </form>

                            </div>
                        </Stepper>
                    </div>

                    <PriceSidebar cartItems={cartItems} />
                </div>
            </main>
        </>
    );
};

export default Payment;

// import axios from 'axios';
// import { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import PriceSidebar from './PriceSidebar';
// import Stepper from './Stepper';
// // import {
// //     CardNumberElement,
// //     CardCvcElement,
// //     CardExpiryElement,
// //     useStripe,
// //     useElements,
// // } from '@stripe/react-stripe-js';
// import { clearErrors } from '../../actions/orderAction';
// import { useSnackbar } from 'notistack';
// import { post } from '../../utils/paytmForm';
// import FormControl from '@mui/material/FormControl';
// import FormControlLabel from '@mui/material/FormControlLabel';
// import Radio from '@mui/material/Radio';
// import RadioGroup from '@mui/material/RadioGroup';
// import MetaData from '../Layouts/MetaData';

// const Payment = () => {

//     const dispatch = useDispatch();
//     // const navigate = useNavigate();
//     const { enqueueSnackbar } = useSnackbar();
//     // const stripe = useStripe();
//     // const elements = useElements();
//     // const paymentBtn = useRef(null);

//     const [payDisable, setPayDisable] = useState(false);

//     const { shippingInfo, cartItems } = useSelector((state) => state.cart);
//     const { user } = useSelector((state) => state.user);
//     const { error } = useSelector((state) => state.newOrder);

//     const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

//     const paymentData = {
//         amount: Math.round(totalPrice),
//         email: user.email,
//         phoneNo: shippingInfo.phoneNo,
//     };

//     // const order = {
//     //     shippingInfo,
//     //     orderItems: cartItems,
//     //     totalPrice,
//     // }

//     const submitHandler = async (e) => {
//         e.preventDefault();

//         // paymentBtn.current.disabled = true;
//         setPayDisable(true);

//         try {
//             const config = {
//                 headers: {
//                     "Content-Type": "application/json",
//                 },
//             };

//             const { data } = await axios.post(
//                 '/api/v1/payment/process',
//                 paymentData,
//                 config,
//             );

//             let info = {
//                 action: "https://securegw-stage.paytm.in/order/process",
//                 params: data.paytmParams
//             }

//             post(info)

//             // if (!stripe || !elements) return;

//             // const result = await stripe.confirmCardPayment(client_secret, {
//             //     payment_method: {
//             //         card: elements.getElement(CardNumberElement),
//             //         billing_details: {
//             //             name: user.name,
//             //             email: user.email,
//             //             address: {
//             //                 line1: shippingInfo.address,
//             //                 city: shippingInfo.city,
//             //                 country: shippingInfo.country,
//             //                 state: shippingInfo.state,
//             //                 postal_code: shippingInfo.pincode,
//             //             },
//             //         },
//             //     },
//             // });

//             // if (result.error) {
//             //     paymentBtn.current.disabled = false;
//             //     enqueueSnackbar(result.error.message, { variant: "error" });
//             // } else {
//             //     if (result.paymentIntent.status === "succeeded") {

//             //         order.paymentInfo = {
//             //             id: result.paymentIntent.id,
//             //             status: result.paymentIntent.status,
//             //         };

//             //         dispatch(newOrder(order));
//             //         dispatch(emptyCart());

//             //         navigate("/order/success");
//             //     } else {
//             //         enqueueSnackbar("Processing Payment Failed!", { variant: "error" });
//             //     }
//             // }

//         } catch (error) {
//             // paymentBtn.current.disabled = false;
//             setPayDisable(false);
//             enqueueSnackbar(error, { variant: "error" });
//         }
//     };

//     useEffect(() => {
//         if (error) {
//             dispatch(clearErrors());
//             enqueueSnackbar(error, { variant: "error" });
//         }
//     }, [dispatch, error, enqueueSnackbar]);


//     return (
//         <>
//             <MetaData title="Ecomzy: Secure Payment | Paytm" />

//             <main className="w-full mt-20">

//                 {/* <!-- row --> */}
//                 <div className="flex flex-col sm:flex-row gap-3.5 w-full sm:w-11/12 mt-0 sm:mt-4 m-auto sm:mb-7">

//                     {/* <!-- cart column --> */}
//                     <div className="flex-1">

//                         <Stepper activeStep={3}>
//                             <div className="w-full bg-white">

//                                 <form onSubmit={(e) => submitHandler(e)} autoComplete="off" className="flex flex-col justify-start gap-2 w-full mx-8 my-4 overflow-hidden">
//                                     <FormControl>
//                                         <RadioGroup
//                                             aria-labelledby="payment-radio-group"
//                                             defaultValue="paytm"
//                                             name="payment-radio-button"
//                                         >
//                                             <FormControlLabel
//                                                 value="paytm"
//                                                 control={<Radio />}
//                                                 label={
//                                                     <div className="flex items-center gap-4">
//                                                         <img draggable="false" className="h-6 w-6 object-contain" src="https://rukminim1.flixcart.com/www/96/96/promos/01/09/2020/a07396d4-0543-4b19-8406-b9fcbf5fd735.png" alt="Paytm Logo" />
//                                                         <span>Paytm</span>
//                                                     </div>
//                                                 }
//                                             />
//                                         </RadioGroup>
//                                     </FormControl>

//                                     <input type="submit" value={`Pay ₹${totalPrice.toLocaleString()}`} disabled={payDisable ? true : false} className={`${payDisable ? "bg-primary-grey cursor-not-allowed" : "bg-primary-orange cursor-pointer"} w-1/2 sm:w-1/4 my-2 py-3 font-medium text-white shadow hover:shadow-lg rounded-sm uppercase outline-none`} />

//                                 </form>

//                                 {/* stripe form */}
//                                 {/* <form onSubmit={(e) => submitHandler(e)} autoComplete="off" className="flex flex-col justify-start gap-3 w-full sm:w-3/4 mx-8 my-4">
//                                 <div>
//                                     <CardNumberElement />
//                                 </div>
//                                 <div>
//                                     <CardExpiryElement />
//                                 </div>
//                                 <div>
//                                     <CardCvcElement />
//                                 </div>
//                                 <input ref={paymentBtn} type="submit" value="Pay" className="bg-primary-orange w-full sm:w-1/3 my-2 py-3.5 text-sm font-medium text-white shadow hover:shadow-lg rounded-sm uppercase outline-none cursor-pointer" />
//                             </form> */}
//                                 {/* stripe form */}

//                             </div>
//                         </Stepper>
//                     </div>

//                     <PriceSidebar cartItems={cartItems} />
//                 </div>
//             </main>
//         </>
//     );
// };

// export default Payment;