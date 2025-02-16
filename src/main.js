/* eslint-disable no-undef */
import { filtradoAnidado, filtradoB, sortAZ, sortZA, computeStats } from "./data.js";
// import data from './data/lol/lol.js';
import data from "./data/countries/countries.js";
// import data from './data/rickandmorty/rickandmorty.js';

const countries = data.countries;

//*********************** SELECCIÓN DE PAÍSES **********************//

const countrySelect = document.getElementById("countrySelect");
const countrySelectb = data.countries.map((country) => country.name.common);
countrySelectb.sort();
countrySelectb.forEach(function (pais) {
  const opcion = document.createElement("option");
  opcion.value = pais;
  opcion.text = pais;
  countrySelect.appendChild(opcion);
});

//*********************** SELECCIÓN DE LENGUAJES **********************//

const languageSelect = document.getElementById("languageSelect");
const languagesSet = new Set();

data.countries.forEach(function (country) {
  for (const languageCode in country.languages) {
    if (languageCode in country.languages) {
      languagesSet.add(country.languages[languageCode]);
    }
  }
});

const languagesArray = Array.from(languagesSet);
languagesArray.sort();

languagesArray.forEach(function (language) {
  const option = document.createElement("option");
  option.value = language;
  option.text = language;
  languageSelect.appendChild(option);
});

//*********************** SELECCIÓN DE HUSOS HORARIOS **********************//

const select = document.getElementById("utcSelect");
const timezonesSet = new Set();

data.countries.forEach((country) => {
  country.timezones.forEach((timezone) => {
    timezonesSet.add(timezone);
  });
});

const sortedTimezones = Array.from(timezonesSet).sort((a, b) => {
  const getTimezoneOffset = (timezone) => {
    const sign = timezone.startsWith("UTC-") ? -1 : 1;
    const [hours, minutes] = timezone.slice(4).split(":").map(Number);
    return sign * (hours * 60 + minutes);
  };

  const offsetA = getTimezoneOffset(a);
  const offsetB = getTimezoneOffset(b);

  return offsetA - offsetB;
});

sortedTimezones.forEach((timezone) => {
  const option = document.createElement("option");
  option.text = timezone;
  option.value = timezone;
  select.appendChild(option);
});

//***************************** */ Función para calcular estadísticas y mostrar gráfico****************//

let chart = null; // Variable para almacenar el gráfico actual

function generateChart() {
  // Si hay un gráfico existente, destruirlo
  if (chart) {
    chart.destroy();
  }
  const continentGraphSelect = document.getElementById("continentGraphSelect");
  const selectedContinent = continentGraphSelect.value;

  // Filtrar los países por continente seleccionado
  const filteredCountries = countries.filter((country) =>
    country.continents.includes(selectedContinent)
  );

  // Llamar a la función computeStats con los países filtrados
  const averagePopulation = computeStats(filteredCountries);

  // Mostrar el promedio de la población en el contenedor "contenedorGrafica"
  const graficaContent = document.querySelector(".contenedorGrafica");
  graficaContent.innerHTML = `<div id="error-message" class="error">Average population: ${averagePopulation.toLocaleString()}</div>`;

  // Ajustar el tamaño del canvas
  const chartCanvas = document.getElementById("chart");
  chartCanvas.width = 1000; // Ajusta el valor según tus necesidades
  chartCanvas.height = 500; // Ajusta el valor según tus necesidades

  // Crear un gráfico de barras utilizando Chart.js
  const ctx = document.getElementById("chart").getContext("2d");
  chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: filteredCountries.map((country) => country.name.common),
      datasets: [
        {
          label: "Population",
          data: filteredCountries.map((country) => country.population),
          backgroundColor: "rgba(19, 16, 78, 1)",
          borderColor: "rgba(19, 16, 78, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        x: {
          ticks: {
            autoSkip: false,
            font: {
              size: 6,
            },
          },
        },
        y: {
          ticks: {
            min: 10000000, // Establecer el valor mínimo en el eje Y
            stepSize: 5000000, // Establecer el tamaño del intervalo en el eje Y
            font: {
              size: 6, // Ajustar el tamaño de la letra en el eje Y
            },
          },
        },
      },
    },
  });

  // Mostrar el modal
  document.getElementById("chartModal").style.display = "block";
}

// Agrega un listener al botón de cierre del modal
document
  .querySelector("#chartModal .close")
  .addEventListener("click", function () {
    // Oculta el modal al hacer clic en el botón de cierre
    document.getElementById("chartModal").style.display = "none";
  });


// Agregar evento de escucha al botón
document.getElementById("openModalButton").addEventListener("click", generateChart);

//*********************** PRESENCIA DE TARJETAS EN EL ROOT **********************//

function showCountries(countries) {
  const rootElement = document.getElementById("root");
  rootElement.innerHTML = "";
  countries.forEach((country) => {
    const cardElement = document.createElement("div");
    cardElement.classList.add("card");
    cardElement.addEventListener("click", () => {
      openModal(country);
    });

    const imageElement = document.createElement("img");
    imageElement.src = country.flags.png;

    const nameElement = document.createElement("p");
    nameElement.textContent = country.name.common;

    cardElement.appendChild(nameElement);
    cardElement.appendChild(imageElement);
    rootElement.appendChild(cardElement);
  });
}

showCountries(data.countries);

//*********************** FUNCIONES PARA MODAL **********************//

// Función para agregar información a la tabla
function addCardInfo(label, value) {
  const table = document.getElementById("cardTable");
  const row = document.createElement("tr");

  const labelCell = document.createElement("th");
  labelCell.textContent = label + ":";
  row.appendChild(labelCell);

  const valueCell = document.createElement("td");
  valueCell.textContent = value;
  row.appendChild(valueCell);

  table.appendChild(row);
}

// Función para abrir el modal y mostrar los datos del país
function openModal(country) {
  const modal = document.getElementById("myModal");
  /* const modalTitle = document.getElementById("modalTitle"); */
  const modalImage = document.getElementById("modalImage");
  const cardTable = document.getElementById("cardTable");

  // Limpia el contenido previo de la tabla
  cardTable.innerHTML = "";

  // Agrega la información del país a la tabla
  addCardInfo("Common Name", country.name.common);
  addCardInfo("Official Name", country.name.official);
  addCardInfo("TLD", country.tld.join(", "));
  addCardInfo("Independent", country.independent ? "Yes" : "No");
  addCardInfo("Capital", country.capital.join(", "));
  addCardInfo("Subregion", country.subregion);

  // Agrega los idiomas disponibles a la tabla
  const languages = Object.entries(country.languages);
  languages.forEach(([code, name]) => {
    addCardInfo("Language (" + code + ")", name);
  });
  // Verificar si la clave 'borders' existe antes de acceder a ella
  if (country.borders) {
    addCardInfo("Borders", country.borders.join(", "));
  } else {
    addCardInfo("Borders", "No borders found");
  }
  addCardInfo("Area", country.area);
  addCardInfo("Population", country.population);
  // Iterar sobre las claves del objeto country.gini
  for (const year in country.gini) {
    addCardInfo(`Gini (${year})`, country.gini[year]);
  }
  addCardInfo("FIFA", country.fifa);
  addCardInfo("Time Zones", country.timezones.join(", "));
  addCardInfo("Continent", country.continents.join(", "));

  // Asigna la imagen y título del modal
  /* modalTitle.textContent = country.name.common; */
  modalImage.src = country.flags.png;

  // Muestra el modal
  modal.style.display = "block";
}

// Función para cerrar el modal
function closeModal() {
  const modal = document.getElementById("myModal");
  modal.style.display = "none";
}

// Evento para cerrar el modal al hacer clic fuera del contenido
window.onclick = function (event) {
  const modal = document.getElementById("myModal");
  if (event.target === modal) {
    closeModal();
  }
};

//*********************** FUNCIONES DE FILTRADO **********************//

const boton = document.getElementById("filtrar");
boton.addEventListener("click", filtrandoDatos);
let dataCountries = data.countries;

function filtrandoDatos() {
  const selPais = document.getElementById("countrySelect").value;
  const selContinent = document.getElementById("continenteSelect").value;
  const selLanguages = document.getElementById("languageSelect").value;
  const selUtc = document.getElementById("utcSelect").value;
  const selIndep = document.getElementById("indepSelect").value;

  document.getElementById("countrySelect").value = "";
  document.getElementById("continenteSelect").value = "";
  document.getElementById("languageSelect").value = "";
  document.getElementById("utcSelect").value = "";
  document.getElementById("indepSelect").value = "";

  if (selPais !== "") {
    dataCountries = filtradoB(data.countries, selPais);
    showCountries(dataCountries);
  }

  if (
    selContinent !== "" ||
    selLanguages !== "" ||
    selUtc !== "" ||
    selIndep !== ""
  ) {
    dataCountries = filtradoAnidado(
      data.countries,
      selContinent,
      selLanguages,
      selUtc,
      selIndep
    );
    if (dataCountries.length > 0) {
      showCountries(dataCountries);
    } else {
      const errorMessage =
        "Oops!, there are no countries with the options you selected, try others.";
      document.getElementById(
        "root"
      ).innerHTML = `<div id="error-message" class="error">${errorMessage}</div>`;
    }
  }
}

//*********************** FUNCIONES DE ORDENADO **********************//

const sortButton = document.getElementById("sortButton");
sortButton.addEventListener("click", ordenandoDatos);

function ordenandoDatos() {
  const selectedOption = document.getElementById("ordenar").value;

  if (selectedOption === "1") {
    const dataAz = sortAZ(dataCountries);
    return showCountries(dataAz);
  } else if (selectedOption === "2") {
    const dataZa = sortZA(dataCountries);
    return showCountries(dataZa);
  }
}

//*********************** FUNCIONES DE BÚSQUEDA GENERAL **********************//

// Función para buscar en claves adicionales
function searchInCountryKeys(country, searchTerm) {
  const keysToSearch = ["capital", "subregion", "languages", "continents", "name"];

  for (let i = 0; i < keysToSearch.length; i++) {
    const key = keysToSearch[i];
    // Buscar en la clave "name"
    if (
      key === "name" &&
      country.name &&
      country.name.common.toLowerCase().includes(searchTerm.toLowerCase().trim())
    ) {
      return true;
    }

    if (
      country[key] &&
      country[key].toString().toLowerCase().trim().includes(searchTerm.toLowerCase().trim())
    ) {
      return true;
    }
  }

  // Buscar en la clave "languages"
  if (country.languages) {
    for (const langKey in country.languages) {
      const language = country.languages[langKey]
        .toString()
        .trim()
        .toLowerCase();
      if (language.includes(searchTerm.toLowerCase().trim())) {
        return true;
      }
    }
  }

  return false;
}

// Obtener elementos del DOM
const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");
const searchResults = document.getElementById("search-results");

// Función de búsqueda
function search() {
  const searchTerm = searchInput.value.toLowerCase();
  searchResults.innerHTML = "";

  for (let i = 0; i < countries.length; i++) {
    const country = countries[i];
    const countryName = country.name.common;

    // Buscar en el nombre del país y en otras claves
    if (
      countryName.includes(searchTerm) ||
      searchInCountryKeys(country, searchTerm.toLowerCase().trim())
    ) {
      const result = document.createElement("div");
      result.classList.add("country-result");

      const table = document.createElement("table");
      const row = table.insertRow();

      const countryNameCell = row.insertCell();
      countryNameCell.innerHTML = "<h3>" + countryName + "</h3>";
      countryNameCell.colSpan = 2;

      for (const prop in country) {
        if (typeof country[prop] !== "object") {
          const newRow = table.insertRow();
          const propCell = newRow.insertCell();
          const valueCell = newRow.insertCell();

          propCell.innerHTML = "<strong>" + prop + "</strong>";
          valueCell.innerHTML = country[prop];
        }
      }

      result.appendChild(table);
      searchResults.appendChild(result);
    }
  }
}

// Evento click del botón de búsqueda
searchButton.addEventListener("click", search);


// Evento click del botón de HOME
const homeLink = document.getElementById("home-link");
homeLink.addEventListener("click", function() {
  location.reload();
});