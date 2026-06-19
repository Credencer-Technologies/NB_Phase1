import provider1 from "../assets/Images/provider1.jpg";
import provider2 from "../assets/Images/provider2.jpg";
import provider3 from "../assets/Images/provider3.jpg";
import provider4 from "../assets/Images/provider4.jpg";
import provider5 from "../assets/Images/provider5.jpg";
import provider6 from "../assets/Images/provider6.jpg";
import provider7 from "../assets/Images/provider7.jpg";
import provider8 from "../assets/Images/provider8.jpg";

import { useState } from "react";
import "./Explore.css";
import {
FaSearch,
FaMapMarkerAlt,
FaStar
} from "react-icons/fa";

const providers = [
{
id:1,
name:"Priya Das",
category:"Beauty & Wellness",
city:"Hyderabad",
rating:4.9,
completed:186,
image:provider1
},
{
id:2,
name:"Nashra Mehendi Artist",
category:"Mehndi & Bridal",
city:"Bengaluru",
rating:4.8,
completed:140,
image:provider2
},
{
id:3,
name:"Sharma Tailoring",
category:"Tailoring & Fashion",
city:"Bengaluru",
rating:4.7,
completed:210,
image:provider3
},
{
id:4,
name:"Lakshmi caterers",
category:"Food & Catering",
city:"Hyderabad",
rating:5,
completed:310,
image:provider4
},
{
id:5,
name:"BrainSpark Academy",
category:"Education & Tutoring",
city:"Karimnagar",
rating:4.6,
completed:120,
image:provider5
},
{
id:6,
name:"Yoga By Kavya",
category:"Yoga & Fitness",
city:"Hyderabad",
rating:4.9,
completed:165,
image:provider6
},
{
id:7,
name:"Home Care Services",
category:"Home Services",
city:"Nizamabad",
rating:4.8,
completed:240,
image:provider7
},
{
id:8,
name:"Creative Arts Hub",
category:"Arts & Crafts",
city:"hyderabad",
rating:4.7,
completed:98,
image:provider8
}
];

function Explore() {

const [category,setCategory] = useState("");
const [city,setCity] = useState("");

const filteredProviders = providers.filter(provider => {

const categoryMatch =
category === "" ||
provider.category === category;

const cityMatch =
city === "" ||
provider.city.toLowerCase().includes(
city.toLowerCase()
);

return categoryMatch && cityMatch;
});

return (
<div className="explore">

<div className="hero">

<h1>Discover Trusted Women Service Providers</h1>

<p>
Find verified women entrepreneurs across
multiple service categories.
</p>
</div>

<div className="explore-stats">

  <div className="stat-card">
    <h2>500+</h2>
    <p>Women Entrepreneurs</p>
  </div>

  <div className="stat-card">
    <h2>20+</h2>
    <p>Categories</p>
  </div>

  <div className="stat-card">
    <h2>10k+</h2>
    <p>Customers Served</p>
  </div>

</div>

<div className="filter-bar">

<select
value={category}
onChange={(e)=>setCategory(e.target.value)}
>
<option value="">All Categories</option>
<option>Beauty & Wellness</option>
<option>Mehndi & Bridal</option>
<option>Tailoring & Fashion</option>
<option>Food & Catering</option>
<option>Education & Tutoring</option>
<option>Yoga & Fitness</option>
<option>Home Services</option>
<option>Arts & Crafts</option>
<option>Others</option>

</select>

<input
type="text"
placeholder="Search city..."
value={city}
onChange={(e)=>setCity(e.target.value)}
/>

<button>
<FaSearch />
Search
</button>

</div>

<div className="providers-grid">

{filteredProviders.length === 0 ? (

<div className="empty-state">
No providers found for your search.
Try a different category or city.
</div>

) : (

filteredProviders.map((provider)=>(
<div
className="provider-card"
key={provider.id}
>

<div className="image-box">
  {provider.rating >= 5.0 && (
  <span className="featured-badge">
    ⭐ Featured
  </span>
  
)}

<img
src={provider.image}
alt={provider.name}
/>

<div className="overlay"></div>

</div>

<div className="card-body">

<h3>{provider.name}</h3>

<span className="category-tag">
{provider.category}
</span>

<p className="city">
<FaMapMarkerAlt />
{provider.city}
</p>

<div className="rating">

<FaStar />

<span>{provider.rating}</span>
{provider.rating >= 4.8 && (
<span className="verified-badge">
✔ Verified
</span>
)}

</div>

<div className="completed">
{provider.completed} Services Completed
</div>


<button
className="view-btn"
onClick={() =>
alert(`${provider.name} Profile Page Coming Soon`)
}
>
View Profile
</button>

</div>

</div>
))
)}

</div>

</div>
);
}

export default Explore;