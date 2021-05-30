let geocodingApiKey = `pk.eyJ1IjoiYWJvcm9uZGlhIiwiYSI6ImNrcDRxNDc1ODA0YTEybm5xcGl0bXU5N3AifQ.HKd0aKNsdN7FAtDTanMDWg`;

let tripPlanningApiKey = `AU_jMzvljRU2bGPyGkq0`;

const origingFormEle = document.querySelector(".origin-form");

const destinationFormEle = document.querySelector(".destination-form");

const originListEle = document.querySelector(".origins");

const destinationListEle = document.querySelector(".destinations");

const planMyTripButtonEle = document.querySelector(".plan-trip");

const tripsPlanListEle = document.querySelector(".my-trip");

let coords ={originLat:'',originLong:'',destinationLat:'',destinationLong:''};

async function getData(searchPlaceKey) {
   
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${searchPlaceKey}.json?bbox=-97.325875,49.766204,-96.953987,49.99275&access_token=${geocodingApiKey}`;

  const response = await fetch(url);
  const data = await response.json();

  return data.features;
}

async function getTrips(tripPlanningApiKey) {
  
  let date = new Date().toLocaleDateString();
  let time = new Date().toLocaleTimeString("en-GB");
 
  if(coords.originLat===coords.destinationLat&&coords.originLong===coords.destinationLong){
    return   tripsPlanListEle.innerHTML =
    '<h1 class="red">Your are at your Destination</h1>';
  }
  
  let url = `https://api.winnipegtransit.com/v3/trip-planner.json?api-key=${tripPlanningApiKey}&origin=geo/${coords.originLat},${coords.originLong}&destination=geo/${coords.destinationLat},${coords.destinationLong}&date=${date}&time=${time}&mode=arrive-before`;

   try{
    const response = await fetch(url);
    const data = await response.json();
    if(data===undefined){
      return   tripsPlanListEle.innerHTML =
    '<h1 class="red">Sorry! Cannot process your request at this time.</h1>';
    
    }

    return data;
   }catch(error){
     console.log(error);
     tripsPlanListEle.innerHTML =
    '<h1 class="red">Cannot find your locations, please validate your Origin and Destination location.</h1>';
    }

}

function renderList(dataArray, listElement) {
  listElement.innerHTML = "";
  dataArray.forEach((element) => {
    const lat = element.center[1];
    const long = element.center[0];

    const placeName = element.place_name;
    const placeNameArray = placeName.split(",");

    listElement.innerHTML += `
    <li data-long=${long} data-lat=${lat} class="">
    <div class="name">${placeNameArray[0]}</div>
    <div>${placeNameArray[1]}</div>
  </li>
    `;
  });
}

function renderTrips(tripsPlansArray) {
  tripsPlanListEle.innerHTML = "";
  if (tripsPlansArray.length < 1) {
    tripsPlanListEle.innerHTML =
      '<h1 class="red">No trips are available at this time.</h1>';
  }
   else{
     addTripHTML(tripsPlansArray);
   }
}

function addTripHTML(tripsPlansArray) {
  tripsPlansArray.forEach((planObj) => {
    tripsPlanListEle.innerHTML += `<hr><h1>${planObj.number}</h1><hr>`;
    renderTripSegments(planObj);
  });
}

function renderTripSegments(planObj) {
  planObj.segments.forEach((step) => {

    if (step.type === "walk") {
      tripsPlanListEle.innerHTML += `
    <li>
       <i class="fas fa-walking" aria-hidden="true"></i>Walk for ${step["times"]["durations"].total} minutes
       to ${(step["to"]["destination"])
          ? `your destination`
          : `stop ${step["to"]["stop"].key} - ${step["to"]["stop"].name}`}.
     </li>
       `;
    }

    if (step.type === "ride") {
      tripsPlanListEle.innerHTML += `
    <li>
    <i class="fas fa-bus" aria-hidden="true"></i>Ride the ${step["route"].name} for ${step["times"]["durations"].total} minutes.
     </li>
       `;
    }

    if (step.type === "transfer") {
      tripsPlanListEle.innerHTML += `
        <li>
      <i class="fas fa-ticket-alt" aria-hidden="true"></i>Transfer from stop
       ${step["from"]["stop"].key} - ${step["from"]["stop"].name} to stop ${step["to"]["stop"].key} - ${step["to"]["stop"].name}.
       </li>
       `;
    }
  });
}

function handleSearchInputEvent(eventElement) {
  eventElement.addEventListener("submit", (event) => {
    event.preventDefault();
    let searchInput = event.target.firstElementChild.value;
    displayOriginPlacesList(eventElement, searchInput);
    displayDestinationPlacesList(eventElement, searchInput);
  });
}

function displayDestinationPlacesList(eventElement, searchInput) {
  if (eventElement === destinationFormEle) {
    const searchOutputArray2 = getData(searchInput).then(
      (searchOutputArray2) => {
        renderList(searchOutputArray2, destinationListEle);
      }
    );
  }
}

function displayOriginPlacesList(eventElement, searchInput) {
  if (eventElement === origingFormEle) {
    const searchOutputArray1 = getData(searchInput).then(
      (searchOutputArray1) => {
        renderList(searchOutputArray1, originListEle);
      }
    );
  }
}

function handleListEvents(eventListElement) {
  eventListElement.addEventListener("click", (event) => {
    event.preventDefault();
    setOriginCoords(eventListElement, event);
    setDestinationCoords(eventListElement, event);
  });
}

function setDestinationCoords(eventListElement, event) {
  if (eventListElement === destinationListEle) {
    addSelectClass(event);

    destinationInputLong = event.target.closest("li").getAttribute("data-long");
    coords.destinationLong = destinationInputLong;

    destinationInputLat = event.target.closest("li").getAttribute("data-lat");
    coords.destinationLat = destinationInputLat;
  }
}

function setOriginCoords(eventListElement, event) {
  if (eventListElement === originListEle) {
    addSelectClass(event);
    let originInputLong = event.target.closest("li").getAttribute("data-long");
    coords.originLong = originInputLong;
    let originInputLat = event.target.closest("li").getAttribute("data-lat");
    coords.originLat = originInputLat;
  }
}

function addSelectClass(event) {
  if (!event.target.closest("li").classList.contains("selected")) {
    event.target.closest("li").classList.add("selected");
  } else {
    event.target.closest("li").classList.remove("selected");
  }
}

planMyTripButtonEle.addEventListener("click", (event) => { 
  event.preventDefault();
  const tripPlans = getTrips(tripPlanningApiKey)
  .then((tripPlans) => { 
    if(tripPlans.plans===undefined){ 
      return   tripsPlanListEle.innerHTML =
      '<h1 class="red">Unable to find routes, Try Again with valid inputs!!!</h1>';
     }
    renderTrips(tripPlans.plans);
  });
});

handleSearchInputEvent(origingFormEle);
handleSearchInputEvent(destinationFormEle);
handleListEvents(originListEle);
handleListEvents(destinationListEle);


