import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store';
import { SnackbarProvider } from 'notistack';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// Load your Stripe public key
const stripePromise = loadStripe('pk_test_51RJgFnEL0vwufSpyvIjJGt7FnB2xtAQV1ePyQ8AbHWbWooHh0tdNnltwi7xYFdl22kdb8fA0II8rHAB3wHMK7PRu00B8GUfTpE'); // Replace with your actual public key

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <SnackbarProvider
        maxSnack={2}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
      >
        <Router>
          {/* Wrap your app with Elements and provide the stripe promise */}
          <Elements stripe={stripePromise}>
            <App />
          </Elements>
        </Router>
      </SnackbarProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

// import React from 'react';
// import ReactDOM from 'react-dom';
// import './index.css';
// import App from './App';
// import { BrowserRouter as Router } from 'react-router-dom';
// import { Provider } from 'react-redux';
// import store from './store';
// import { SnackbarProvider } from 'notistack';

// ReactDOM.render(
//   <React.StrictMode>
//     <Provider store={store}>
//       <SnackbarProvider
//         maxSnack={2}
//         anchorOrigin={{
//           vertical: 'bottom',
//           horizontal: 'center',
//         }}
//       >
//         <Router>
//           <App />
//         </Router>
//       </SnackbarProvider>
//     </Provider>
//   </React.StrictMode>,
//   document.getElementById('root')
// );