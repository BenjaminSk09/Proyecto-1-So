// Simulador de gestión de procesos
document.addEventListener('DOMContentLoaded', () => {

    // RAM y procesos
    const RAM_TOTAL_MB = 1024;
    let ramDisponible_MB = RAM_TOTAL_MB;
    let runningProcesses = [];
    let waitingQueue = [];
    let nextPid = 1;

    // Elementos del DOM
    const form = document.getElementById('process-form');
    const ramStatusEl = document.getElementById('ram-status');
    const ramBarEl = document.getElementById('ram-bar');
    const runningProcessesEl = document.getElementById('running-processes');
    const waitingQueueEl = document.getElementById('waiting-queue');

    // Clase del proceso
    class Proceso {
        constructor(pid, nombre, memoria, duracion) {
            this.pid = pid;
            this.nombre = nombre;
            this.memoria = memoria;
            this.duracion = duracion;
        }
    }

    // Intenta correr procesos si hay memoria
    function checkAndRunProcesses() {
        for (let i = 0; i < waitingQueue.length; i++) {
            const proceso = waitingQueue[i];
            if (ramDisponible_MB >= proceso.memoria) {
                ramDisponible_MB -= proceso.memoria;
                runningProcesses.push(proceso);
                waitingQueue.splice(i, 1);
                i--; // porque quitamos uno del array
            }
        }
        updateUI();
    }

    // Simula el tiempo: resta duración y elimina los que terminan
    function simulateExecution() {
        const completedPids = [];

        for (const proceso of runningProcesses) {
            proceso.duracion--;
            if (proceso.duracion <= 0) {
                completedPids.push(proceso.pid);
            }
        }

        runningProcesses = runningProcesses.filter(proceso => {
            if (completedPids.includes(proceso.pid)) {
                ramDisponible_MB += proceso.memoria;
                return false;
            }
            return true;
        });

        checkAndRunProcesses();
        updateUI();
    }

    // Refresca la UI (RAM, procesos, cola)
    function updateUI() {
        const ramUsagePercentage = ((RAM_TOTAL_MB - ramDisponible_MB) / RAM_TOTAL_MB) * 100;

        ramStatusEl.innerHTML = `
            <p class="font-bold text-lg">Memoria disponible: <span class="text-green-500">${ramDisponible_MB}</span> MB</p>
            <p class="text-sm text-gray-500">Memoria ocupada: <span class="text-red-500">${RAM_TOTAL_MB - ramDisponible_MB}</span> MB</p>
        `;

        ramBarEl.style.width = `${ramUsagePercentage}%`;
        ramBarEl.style.backgroundColor = ramUsagePercentage > 80 ? 'rgb(239 68 68)' : 'rgb(34 197 94)';

        // Procesos activos
        runningProcessesEl.innerHTML = runningProcesses.length > 0 ? '' : '<p class="text-gray-500">No hay procesos en ejecución.</p>';
        runningProcesses.forEach(proceso => {
            const card = createProcessCard(proceso, 'bg-red-100 border-red-300');
            runningProcessesEl.appendChild(card);
        });

        // Cola de espera
        waitingQueueEl.innerHTML = waitingQueue.length > 0 ? '' : '<p class="text-gray-500">La cola de espera está vacía.</p>';
        waitingQueue.forEach(proceso => {
            const card = createProcessCard(proceso, 'bg-yellow-100 border-yellow-300');
            waitingQueueEl.appendChild(card);
        });
    }

    // Crea la "tarjeta" visual de un proceso
    function createProcessCard(proceso, colorClass) {
        const card = document.createElement('div');
        card.className = `p-4 ${colorClass} rounded-lg shadow-sm`;
        card.innerHTML = `
            <p class="text-sm font-semibold text-gray-800">PID: ${proceso.pid}</p>
            <p class="text-lg font-bold text-gray-900">${proceso.nombre || `Proceso-${proceso.pid}`}</p>
            <p class="text-sm text-gray-600">Memoria: ${proceso.memoria} MB</p>
            <p class="text-sm text-gray-600">Duración restante: ${proceso.duracion} seg</p>
        `;
        return card;
    }

    // Cuando se manda el form, se crea un proceso nuevo
    function handleFormSubmit(event) {
        event.preventDefault();

        const nombre = document.getElementById('process-name').value.trim();
        const memoria = parseInt(document.getElementById('process-memory').value, 10);
        const duracion = parseInt(document.getElementById('process-duration').value, 10);

        if (isNaN(memoria) || memoria < 1 || isNaN(duracion) || duracion < 1) {
            alert("Por favor, ingresa valores válidos para memoria y duración.");
            return;
        }

        const nuevoProceso = new Proceso(nextPid++, nombre, memoria, duracion);
        waitingQueue.push(nuevoProceso);

        document.getElementById('process-name').value = '';

        checkAndRunProcesses();
        updateUI();
    }

    // Iniciar
    form.addEventListener('submit', handleFormSubmit);
    setInterval(simulateExecution, 1000);
    updateUI();
});
