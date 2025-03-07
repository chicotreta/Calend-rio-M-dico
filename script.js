let currentDate = new Date();
    let selectedDate = null;
    let selectedEvent = null;
    let events = JSON.parse(localStorage.getItem("events")) || {};
    let isDarkMode = false;

    const monthNames = [
      "Janeiro", "Fevereiro", "Março", "Abril",
      "Maio", "Junho", "Julho", "Agosto",
      "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    function updateCalendar() {
      const calendarBody = document.querySelector(".calendar-body");
      const monthYear = document.getElementById("monthYear");
      
      monthYear.textContent = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
      calendarBody.innerHTML = '';

      // Adicionar cabeçalhos dos dias da semana
      const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      daysOfWeek.forEach(day => {
        const dayElement = document.createElement("div");
        dayElement.className = "day header";
        dayElement.textContent = day;
        calendarBody.appendChild(dayElement);
      });

      const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
      const totalDays = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
      const prevMonthDays = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();

      // Dias do mês anterior
      for (let i = 0; i < firstDay; i++) {
        const day = document.createElement("div");
        day.className = "day other-month";
        day.textContent = prevMonthDays - firstDay + i + 1;
        calendarBody.appendChild(day);
      }

      // Dias atuais
      for (let i = 1; i <= totalDays; i++) {
        const day = document.createElement("div");
        day.className = "day" + (isToday(i) ? " active" : "");
        day.textContent = i;

        // Destaque para fins de semana
        if ([0, 6].includes(new Date(currentDate.getFullYear(), currentDate.getMonth(), i).getDay())) {
          day.classList.add("weekend");
        }

        const eventKey = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${i}`;
        if (events[eventKey] && events[eventKey].length > 0) {
          day.classList.add("has-events");
        }

        const eventContainer = document.createElement("div");
        eventContainer.style.position = 'relative';
        eventContainer.style.height = '100%';

        if (events[eventKey]) {
          const counter = document.createElement("div");
          counter.className = "event-counter";
          counter.textContent = events[eventKey].length;
          eventContainer.appendChild(counter);

          events[eventKey].forEach((event, index) => {
            const eventElement = createEventElement(event, eventKey, index);
            eventContainer.appendChild(eventElement);
          });
        }

        day.appendChild(eventContainer);
        day.onclick = () => openModal(i);
        calendarBody.appendChild(day);
      }

      // Dias do próximo mês
      const remaining = 42 - (firstDay + totalDays);
      for (let i = 1; i <= remaining; i++) {
        const day = document.createElement("div");
        day.className = "day other-month";
        day.textContent = i;
        calendarBody.appendChild(day);
      }
    }

    function createEventElement(event, eventKey, index) {
      const eventElement = document.createElement("div");
      eventElement.className = "event";
      eventElement.textContent = event.title;

      const details = document.createElement("div");
      details.className = "event-details";
      details.innerHTML = `
        <strong>${event.title}</strong><br>
        <em>${formatDate(eventKey)}</em><br>
        <p>${event.description || 'Sem descrição'}</p>
      `;

      eventElement.appendChild(details);
      eventElement.onclick = (e) => {
        e.stopPropagation();
        openEditModal(eventKey, index);
      };
      return eventElement;
    }

    function formatDate(dateString) {
      const [year, month, day] = dateString.split("-");
      return `${day}/${month}/${year}`;
    }

    function isToday(day) {
      const today = new Date();
      return (
        day === today.getDate() &&
        currentDate.getMonth() === today.getMonth() &&
        currentDate.getFullYear() === today.getFullYear()
      );
    }

    function changeMonth(direction) {
      currentDate.setMonth(currentDate.getMonth() + direction);
      updateCalendar();
    }

    function openModal(day) {
      selectedDate = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${day}`;
      document.getElementById("eventTitle").value = "";
      document.getElementById("eventDescription").value = "";
      document.getElementById("modalTitle").textContent = "Novo Evento";
      document.getElementById("eventModal").style.display = "flex";
      selectedEvent = null;
    }

    function openEditModal(eventKey, index) {
      selectedDate = eventKey;
      selectedEvent = index;
      const event = events[eventKey][index];
      document.getElementById("eventTitle").value = event.title;
      document.getElementById("eventDescription").value = event.description;
      document.getElementById("modalTitle").textContent = "Editar Evento";
      document.getElementById("eventModal").style.display = "flex";
    }

    function closeModal() {
      document.getElementById("eventModal").style.display = "none";
    }

    function saveEvent() {
      const title = document.getElementById("eventTitle").value.trim();
      const description = document.getElementById("eventDescription").value.trim();

      if (!title) {
        alert("O título do evento é obrigatório!");
        return;
      }

      if (!events[selectedDate]) events[selectedDate] = [];

      if (selectedEvent !== null) {
        events[selectedDate][selectedEvent] = { title, description };
      } else {
        if (events[selectedDate].length >= 3) {
          alert("Limite de 3 eventos por dia atingido!");
          return;
        }
        events[selectedDate].push({ title, description });
      }

      localStorage.setItem("events", JSON.stringify(events));
      updateCalendar();
      closeModal();
    }

    function deleteEvent() {
      if (confirm("Tem certeza que deseja excluir este evento?")) {
        events[selectedDate].splice(selectedEvent, 1);
        if (events[selectedDate].length === 0) delete events[selectedDate];
        localStorage.setItem("events", JSON.stringify(events));
        updateCalendar();
        closeModal();
      }
    }

    function updateClock() {
      const now = new Date();
      document.getElementById("digitalClock").textContent = 
        `${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR', { hour12: false })}`;
    }
    setInterval(updateClock, 1000);
    updateClock();

    function toggleDarkMode() {
      isDarkMode = !isDarkMode;
      document.body.classList.toggle("dark-mode", isDarkMode);
      const toggleButton = document.querySelector(".toggle-dark-mode");
      toggleButton.textContent = isDarkMode ? "Modo Claro" : "Modo Escuro";
    }

    function exportEvents() {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(events));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", "events_" + new Date().toISOString().slice(0, 10) + ".json");
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      document.body.removeChild(downloadAnchorNode);
    }

    // Inicialização
    updateCalendar();
