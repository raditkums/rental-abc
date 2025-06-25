const cars = [
            { 
                id: 'avanza', 
                name: 'Toyota Avanza', 
                pricePerDay: 500000, 
                image: 'avanza.png' 
            },
            { 
                id: 'innova', 
                name: 'Toyota Kijang Innova', 
                pricePerDay: 700000, 
                image: 'zenix.jpeg' 
            },
            { 
                id: 'hrv', 
                name: 'Honda HRV', 
                pricePerDay: 600000, 
                image: 'hrv.jpeg' 
            },
            { 
                id: 'sigra', 
                name: 'Daihatsu Sigra', 
                pricePerDay: 450000, 
                image: 'sigra.jpeg' 
            }
        ];

        // Fungsi untuk menampilkan pesan ke pengguna (mengganti alert/confirm)
        function showMessage(message, type = 'success') {
            const messageBox = document.getElementById('messageBox');
            messageBox.textContent = message;
            messageBox.className = `message-box ${type}`; // Add type class for styling (e.g., error)
            messageBox.classList.add('show');
            setTimeout(() => {
                messageBox.classList.remove('show');
            }, 3000); // Pesan akan hilang setelah 3 detik
        }

        // Fungsi untuk memuat kartu mobil secara dinamis
        function loadCarCards() {
            const container = document.getElementById('carCardsContainer');
            cars.forEach(car => {
                const carCard = document.createElement('div');
                carCard.className = 'car-card';
                carCard.innerHTML = `
                    <img src="${car.image}" alt="${car.name}" onerror="this.onerror=null;this.src='https://placehold.co/300x200/CCCCCC/666666?text=Image+Not+Found';">
                    <h3>${car.name}</h3>
                    <p>Rp${car.pricePerDay.toLocaleString('id-ID')}/hari</p>
                    <div class="car-options">
                        <div class="car-option-item">
                            <input type="checkbox" id="select-${car.id}" class="car-checkbox" data-car-id="${car.id}">
                            <label for="select-${car.id}">Pilih Mobil</label>
                        </div>
                        <div class="car-option-item">
                            <label for="start_date-${car.id}">Tanggal Mulai Sewa</label>
                            <input type="date" id="start_date-${car.id}" class="start-date-input" data-car-id="${car.id}">
                        </div>
                        <div class="car-option-item">
                            <label for="duration-${car.id}">Durasi (hari)     </label>
                            <input type="number" id="duration-${car.id}" class="duration-input" data-car-id="${car.id}" min="1" value="1">
                        </div>
                    </div>
                `;
                container.appendChild(carCard);
            });

            const today = new Date().toISOString().split('T')[0];
            document.querySelectorAll('.start-date-input').forEach(input => {
                input.setAttribute('min', today);
                input.value = today; 
            });
        }

        // Fungsi untuk menghitung total harga sewa
        function calculateTotal() {
            const summaryList = document.getElementById('summaryList');
            const totalPriceElement = document.getElementById('totalPrice');
            summaryList.innerHTML = ''; // Clear previous summary
            let grandTotal = 0;
            let isValid = true;
            let selectedCarsCount = 0;

            const checkboxes = document.querySelectorAll('.car-checkbox:checked');
            if (checkboxes.length === 0) {
                showMessage('Pilih setidaknya satu mobil untuk dihitung.', 'error');
                totalPriceElement.textContent = `Total Harga: Rp 0`;
                return;
            }

            checkboxes.forEach(checkbox => {
                const carId = checkbox.dataset.carId;
                const car = cars.find(c => c.id === carId);
                const startDateInput = document.getElementById(`start_date-${carId}`);
                const durationInput = document.getElementById(`duration-${carId}`);

                const startDate = startDateInput.value;
                const duration = parseInt(durationInput.value);

                if (!startDate) {
                    showMessage(`Tanggal mulai sewa untuk ${car.name} belum diisi.`, 'error');
                    isValid = false;
                    return;
                }
                if (isNaN(duration) || duration <= 0) {
                    showMessage(`Durasi sewa untuk ${car.name} tidak valid.`, 'error');
                    isValid = false;
                    return;
                }

                selectedCarsCount++;
                const subtotal = car.pricePerDay * duration;
                grandTotal += subtotal;

                const listItem = document.createElement('li');
                listItem.innerHTML = `
                    <span>${car.name} (${duration} hari)</span>
                    <strong>Rp${subtotal.toLocaleString('id-ID')}</strong>
                `;
                summaryList.appendChild(listItem);
            });

            if (!isValid) {
                summaryList.innerHTML = ''; // Clear summary if invalid
                totalPriceElement.textContent = `Total Harga: Rp 0`;
                return;
            }

            totalPriceElement.textContent = `Total Harga: Rp${grandTotal.toLocaleString('id-ID')}`;
            showMessage(`Total harga berhasil dihitung!`, 'success');
        }

        // Fungsi untuk menyimpan pemesanan ke localStorage
        function saveBooking() {
            const customerName = document.getElementById('customerName').value;
            if (!customerName) {
                showMessage('Nama pelanggan harus diisi.', 'error');
                return;
            }

            const summaryList = document.getElementById('summaryList');
            if (summaryList.children.length === 0) {
                showMessage('Hitung total harga terlebih dahulu sebelum menyimpan.', 'error');
                return;
            }

            const selectedCarsData = [];
            const checkboxes = document.querySelectorAll('.car-checkbox:checked');
            let grandTotal = 0; // Recalculate to ensure consistency

            checkboxes.forEach(checkbox => {
                const carId = checkbox.dataset.carId;
                const car = cars.find(c => c.id === carId);
                const startDateInput = document.getElementById(`start_date-${carId}`);
                const durationInput = document.getElementById(`duration-${carId}`);

                const startDate = startDateInput.value;
                const duration = parseInt(durationInput.value);

                if (!startDate || isNaN(duration) || duration <= 0) {
                    // This should ideally be caught by calculateTotal, but as a fallback
                    showMessage(`Data sewa untuk ${car.name} tidak lengkap/valid. Tidak dapat menyimpan.`, 'error');
                    return;
                }

                const subtotal = car.pricePerDay * duration;
                grandTotal += subtotal;

                selectedCarsData.push({
                    carId: car.id,
                    carName: car.name,
                    pricePerDay: car.pricePerDay,
                    startDate: startDate,
                    duration: duration,
                    subtotal: subtotal
                });
            });

            if (selectedCarsData.length === 0) {
                showMessage('Tidak ada mobil yang dipilih atau data tidak valid untuk disimpan.', 'error');
                return;
            }

            const currentBookings = JSON.parse(localStorage.getItem('abcRentCarBookings')) || [];
            const timestamp = new Date().toISOString(); // Unique timestamp

            const newBooking = {
                customerName: customerName,
                cars: selectedCarsData,
                totalPrice: grandTotal,
                timestamp: timestamp
            };

            currentBookings.push(newBooking);
            localStorage.setItem('abcRentCarBookings', JSON.stringify(currentBookings));

            showMessage('Pemesanan berhasil disimpan!', 'success');
            loadSavedBookings(); // Reload the list of saved bookings
            resetForm(); // Optional: reset form after saving
        }

        // Fungsi untuk memuat dan menampilkan pemesanan yang tersimpan
        function loadSavedBookings() {
            const savedBookingsList = document.getElementById('savedBookingsList');
            savedBookingsList.innerHTML = '';
            const currentBookings = JSON.parse(localStorage.getItem('abcRentCarBookings')) || [];

            if (currentBookings.length === 0) {
                savedBookingsList.innerHTML = '<li>Belum ada pemesanan tersimpan.</li>';
                return;
            }

            currentBookings.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // Sort newest first

            currentBookings.forEach(booking => {
                const listItem = document.createElement('li');
                const bookingTime = new Date(booking.timestamp).toLocaleString('id-ID', {
                    year: 'numeric', month: 'long', day: 'numeric',
                    hour: '2-digit', minute: '2-digit', second: '2-digit'
                });

                let carsSummaryHtml = '<ul>';
                booking.cars.forEach(car => {
                    carsSummaryHtml += `<li>${car.carName} (${car.duration} hari) - Rp${car.subtotal.toLocaleString('id-ID')}</li>`;
                });
                carsSummaryHtml += '</ul>';

                listItem.innerHTML = `
                    <strong>Pemesanan oleh: ${booking.customerName}</strong>
                    <span>Waktu: ${bookingTime}</span>
                    <p>Mobil yang disewa:</p>
                    ${carsSummaryHtml}
                    <p><strong>Total Pemesanan: Rp${booking.totalPrice.toLocaleString('id-ID')}</strong></p>
                    <button class="delete-button" onclick="deleteBooking('${booking.timestamp}')">Hapus Pemesanan</button>
                `;
                savedBookingsList.appendChild(listItem);
            });
        }

        // Fungsi untuk menghapus pemesanan
        function deleteBooking(timestamp) {
            let currentBookings = JSON.parse(localStorage.getItem('abcRentCarBookings')) || [];
            const updatedBookings = currentBookings.filter(booking => booking.timestamp !== timestamp);
            localStorage.setItem('abcRentCarBookings', JSON.stringify(updatedBookings));
            showMessage('Pemesanan berhasil dihapus!', 'success');
            loadSavedBookings(); // Reload the list
        }

        // Fungsi untuk mereset formulir setelah pemesanan disimpan
        function resetForm() {
            document.getElementById('customerName').value = '';
            document.getElementById('summaryList').innerHTML = '';
            document.getElementById('totalPrice').textContent = 'Total Harga: Rp 0';
            document.querySelectorAll('.car-checkbox').forEach(checkbox => {
                checkbox.checked = false;
            });
            document.querySelectorAll('.start-date-input').forEach(input => {
                input.value = new Date().toISOString().split('T')[0]; // Reset to today
            });
            document.querySelectorAll('.duration-input').forEach(input => {
                input.value = 1; // Reset to 1 day
            });
        }

        // Inisialisasi aplikasi saat DOM selesai dimuat
        document.addEventListener('DOMContentLoaded', () => {
            loadCarCards();
            loadSavedBookings();
        });