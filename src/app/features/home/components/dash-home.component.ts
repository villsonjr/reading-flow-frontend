import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ReadingBooksService } from 'src/app/core/services/reading-books.service';
import { Chart } from 'chart.js/auto';
import { Reading } from 'src/app/core/models/reading';
import { BookService } from 'src/app/core/services/book.service';
import { AuthorService } from 'src/app/core/services/author.service';
import * as feather from 'feather-icons';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { GridStack, GridStackOptions } from 'gridstack';
import { SystemErrorResponse } from 'src/app/core/models/system-error-response';
import { SystemResponse } from 'src/app/core/models/system-response';
import { AuthService } from 'src/app/authentication/services/auth.service';
import { User } from 'src/app/core/models/user';

@Component({
  selector: 'app-dash-home',
  templateUrl: './dash-home.component.html',
  styleUrls: ['./dash-home.component.scss'],
})
export class DashHomeComponent implements OnInit, AfterViewInit {

  public chart: any;
  bookCount!: number;
  authorCount!: number;
  readingsCount!: number;
  pagesCount!: number;

  avgPagesMonth!: number;
  avgBooksMonth!: number;

  uniqueYears!: string[];
  selectedYear = new Date().getFullYear().toString();
  dynamicChart: boolean = false;

  constructor(private readingService: ReadingBooksService,
    private authService: AuthService,
    private authorService: AuthorService,
    private notificationService: NotificationService,
    private bookService: BookService) { }

  ngOnInit(): void {
    this.loadData();
    feather.replace();
  }

  ngAfterViewInit(): void {

    this.authService.me().subscribe({
      next: (response) => {
        response = response as SystemResponse<User>;
        const user = User.fromJSON(response.payload);

        const dynamicChart = user.preferences.find(pref => pref.key === 'dynamicChart');
        if (dynamicChart) {
          this.dynamicChart = dynamicChart.value.toLowerCase() === 'false';
          this.initializeGridStack();
        }
      }, error: (error: SystemResponse<SystemErrorResponse>) => {
        this.notificationService.error("Erro ao realizar operação");
      }
    });
  }

  initializeGridStack() {
    const options: GridStackOptions = {
      cellHeight: 70,
      acceptWidgets: true,
      staticGrid: this.dynamicChart,

      resizable: { handles: "ne, sw" },
      minRow: 1,
      margin: '.5rem',
      disableResize: false,
      float: false,
      animate: true,

      column: 12,

    };

    const grid = GridStack.init(options, '.grid-stack');

    if (window.innerWidth >= 300 && window.innerWidth < 1024) {
      grid.batchUpdate();
      grid.getGridItems().forEach((el, index) => {
        grid.update(el, { x: 0, y: index, w: 12 });
      });
      grid.commit();
    }

    const gridItems = document.querySelectorAll('.grid-stack-item-content');

    gridItems.forEach(item => {
      item.addEventListener('mousedown', () => {
        (item as HTMLElement).style.cursor = 'grabbing';
      });
      item.addEventListener('mouseup', () => {
        (item as HTMLElement).style.cursor = 'grab';
      });
    });

    grid.on('drag', function (event: Event, el: HTMLElement) {
      const content = el.querySelector('.grid-stack-item-content') as HTMLElement;
      if (content) {
        content.style.cursor = 'grabbing';
      }

      const gridContainer = document.querySelector('.grid-stack') as HTMLElement;
      if (gridContainer) {
        gridContainer.style.cursor = 'grabbing';
      }
    });

    grid.on('dragstart', function (event: Event, el: HTMLElement) {
      const gridContainer = document.querySelector('.grid-stack') as HTMLElement;
      if (gridContainer) {
        gridContainer.style.cursor = 'grabbing';
      }

      setTimeout(() => {
        const placeholders = document.querySelectorAll('.grid-stack-placeholder');
        placeholders.forEach(placeholder => {
          const htmlElement = placeholder as HTMLElement;
          htmlElement.style.backgroundColor = 'rgba(244, 153, 36, 0.1)';
          htmlElement.style.border = '1px dashed #f49924';
          htmlElement.style.borderRadius = '0.5rem'
        });
      }, 0);
    });

    grid.on('dragstop', function (event: Event, el: HTMLElement) {
      const content = el.querySelector('.grid-stack-item-content') as HTMLElement;
      if (content) {
        content.style.cursor = '';
      }

      const gridContainer = document.querySelector('.grid-stack') as HTMLElement;
      if (gridContainer) {
        gridContainer.style.cursor = '';
      }
    });

    grid.on('resizestart', function (event: Event, el: HTMLElement) {
      setTimeout(() => {
        const placeholders = document.querySelectorAll('.grid-stack-placeholder');
        placeholders.forEach(placeholder => {
          const htmlElement = placeholder as HTMLElement;
          htmlElement.style.backgroundColor = 'rgba(244, 153, 36, 0.1)';
          htmlElement.style.border = '1px dashed #f49924';
          htmlElement.style.borderRadius = '0.5rem'
        });
      }, 0);
    });
  }


  loadData() {
    this.bookService.getBooksCount().subscribe({
      next: (response) => {
        response = response as number;
        this.bookCount = response;
      }, error: (error: SystemResponse<SystemErrorResponse>) => {
        this.notificationService.error("Erro ao realizar operação");
      }
    });

    this.authorService.getAuthorsCount().subscribe({
      next: (response) => {
        response = response as number;
        this.authorCount = response;
      }, error: (error: SystemResponse<SystemErrorResponse>) => {
        this.notificationService.error("Erro ao realizar operação");
      }
    });

    this.readingService.getReadings().subscribe({
      next: (response) => {
        response = response as Reading[];
        var readings = response.map(Reading.fromJSON);

        const yearsSet = new Set<string>();

        readings.forEach(reading => {
          const year = reading.readingDate.substring(0, 4);
          yearsSet.add(year);
        });

        this.uniqueYears = Array.from(yearsSet);

        const filteredReadings = readings.filter(reading => {
          const readingYear = new Date(reading.readingDate).getFullYear().toString();
          return readingYear === this.selectedYear;
        });

        this.calculateAverages(filteredReadings);

        this.chartReadingsByAuthor(filteredReadings);
        this.chartReadingsByMonth(filteredReadings);
        this.chartRatingReadings(filteredReadings);
        this.chartRatingByAuthor(filteredReadings);
        this.chartPagesByMonth(filteredReadings);

        this.chartRatingByGenre(filteredReadings);
        this.chartBooksByGenre(filteredReadings);

      }, error: (error: SystemResponse<SystemErrorResponse>) => {
        this.notificationService.error("Erro ao realizar operação");
      }
    });

  }

  calculateAverages(readings: Reading[]) {
    const monthsMap = new Map<string, number>();
    const pagesMap = new Map<string, number>();

    readings.forEach(reading => {
      const month = reading.readingDate.substring(5, 7);
      const pages = reading.book.pages;

      if (monthsMap.has(month)) {
        monthsMap.set(month, monthsMap.get(month)! + 1);
        pagesMap.set(month, pagesMap.get(month)! + pages);
      } else {
        monthsMap.set(month, 1);
        pagesMap.set(month, pages);
      }
    });

    const monthsCount = monthsMap.size;
    const totalPages = Array.from(pagesMap.values()).reduce((acc, curr) => acc + curr, 0);

    this.pagesCount = totalPages;
    this.readingsCount = readings.length;
    this.avgPagesMonth = monthsCount > 0 ? Math.floor(totalPages / monthsCount) : 0;
    this.avgBooksMonth = monthsCount > 0 ? Math.floor(readings.length / monthsCount) : 0;
  }

  chartReadingsByAuthor(readings: Reading[]) {
    const authorsMap = new Map<string, number>();
    readings.forEach(reading => {
      const authorNames = reading.getAuthors();
      const count = authorsMap.get(authorNames) || 0;
      authorsMap.set(authorNames, count + 1);
    });

    const authors = Array.from(authorsMap.keys());
    const bookCounts = Array.from(authorsMap.values());

    const existingChart = Chart.getChart("booksAuthor");
    if (existingChart) {
      existingChart.destroy();
    }

    const ctx = (document.getElementById('booksAuthor') as HTMLCanvasElement).getContext('2d');

    if (ctx) {
      const gradient = ctx.createLinearGradient(0, 0, 0, 400);

      gradient.addColorStop(0, '#f49924');
      gradient.addColorStop(1, '#c24e2e');

      const hoverGradient = ctx.createLinearGradient(0, 0, 0, 400);
      hoverGradient.addColorStop(0, 'rgba(244, 153, 36, 0.8)');
      hoverGradient.addColorStop(1, 'rgba(194, 78, 46, 0.8)');

      new Chart("booksAuthor", {
        type: 'bar',
        data: {
          labels: authors,
          datasets: [{
            label: 'Leituras',
            data: bookCounts,
            backgroundColor: 'rgba(255, 140, 0, 1)',
            hoverBackgroundColor: 'rgb(244, 153, 36, 1)',
            // backgroundColor: gradient,
            // hoverBackgroundColor: hoverGradient,
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                font: {
                  size: 14
                }
              }
            },
            title: {
              display: true,
              text: 'Leituras registradas por Autor',
              padding: {
                top: 10,
                bottom: 30
              }
            }
          },
          scales: {
            x: {
              grid: {
                color: 'rgba(102, 102, 102, 1)'
              }
            },
            y: {
              ticks: { precision: 0 },
              grid: {
                color: 'rgba(102, 102, 102, 1)'
              }
            }
          }
        },
      });
    }

  }

  chartReadingsByMonth(readings: Reading[]) {
    const datesMap = new Map<string, number>();

    readings.forEach(reading => {
      const date = new Date(reading.getReadingDate());
      let monthYear = date.toLocaleString('pt-BR', { month: 'long' });
      monthYear = monthYear[0].toUpperCase() + monthYear.substring(1);
      const count = datesMap.get(monthYear) || 0;
      datesMap.set(monthYear, count + 1);
    });

    const labels = Array.from(datesMap.keys());
    const data = Array.from(datesMap.values());

    const existingChart = Chart.getChart("booksMonth");
    if (existingChart) {
      existingChart.destroy();
    }

    new Chart("booksMonth", {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Leituras',
          data: data,
          fill: false,
          borderColor: 'rgba(255, 140, 0, 1)',
          hoverBackgroundColor: 'rgba(247, 178, 91, 1)',
          tension: 0.1
        }],
      },
      options: {
        responsive: true,
        layout: {
          padding: {
            right: 20
          }
        },
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              font: {
                size: 14
              }
            }
          },
          title: {
            display: true,
            text: 'Leituras registradas por Mês',
            padding: {
              top: 10,
              bottom: 30
            }
          }
        },
        scales: {
          x: {
            reverse: true,
            grid: {
              color: 'rgba(102, 102, 102, 1)'
            }
          },
          y: {
            ticks: { precision: 0 },
            grid: {
              color: 'rgba(102, 102, 102, 1)'
            }
          },

        }
      },
    });
  }

  chartRatingReadings(readings: Reading[]) {
    const ratings = readings.map(reading => reading.rating);
    const ratingCounts = this.countRatings(ratings);
    const labels = ['Muito Ruim', 'Ruim', 'Mediano', 'Bom', 'Muito Bom'];

    const backgroundColors = ['rgb(255, 0, 0, 0.5)', 'rgb(255, 255, 0, 0.5)', 'rgb(244, 153, 36, 0.5)', 'rgb(0, 255, 0, 0.5)', 'rgb(0, 128, 0, 0.5)'];

    const existingChart = Chart.getChart("rating");
    if (existingChart) {
      existingChart.destroy();
    }

    new Chart("rating", {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          label: 'Leituras',
          data: ratingCounts,
          backgroundColor: backgroundColors,
          hoverOffset: 4,
          borderColor: 'rgba(102, 102, 102, 1)',
          borderWidth: 0.5
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              font: {
                size: 14
              }
            }
          },
          title: {
            display: true,
            text: 'Leituras Avaliadas',
            padding: {
              top: 10,
              bottom: 30
            }
          }
        }
      }
    });
  }

  chartRatingByAuthor(readings: Reading[]) {
    const authorsMap = new Map<string, { totalRating: number; count: number }>();

    readings.forEach(reading => {
      const authorNames = reading.getAuthors();
      const rating = reading.rating;
      const authorData = authorsMap.get(authorNames) || { totalRating: 0, count: 0 };
      authorData.totalRating += rating;
      authorData.count++;
      authorsMap.set(authorNames, authorData);
    });

    const authors = Array.from(authorsMap.keys());

    const avgRatings = authors.map(author => {
      const authorData = authorsMap.get(author);
      return authorData ? authorData.totalRating / authorData.count : 0;
    });

    const existingChart = Chart.getChart("ratingAuthor");
    if (existingChart) {
      existingChart.destroy();
    }

    new Chart("ratingAuthor", {
      type: 'bar',
      data: {
        labels: authors,
        datasets: [{
          label: 'Média',
          data: avgRatings,
          backgroundColor: 'rgba(255, 140, 0, 1)',
          hoverBackgroundColor: 'rgb(244, 153, 36, 1)',
        }]
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: 'Avaliação Média por Autor',
            padding: {
              bottom: 30
            }
          },
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              font: {
                size: 14
              }
            }
          }
        },
        indexAxis: 'y',
        responsive: true,

        scales: {
          y: {
            grid: {
              color: 'rgba(102, 102, 102, 1)'
            }
          },
          x: {
            ticks: {
              precision: 1
            },
            grid: {
              color: 'rgba(102, 102, 102, 1)'
            }
          }
        }
      }
    });
  }

  chartPagesByMonth(readings: Reading[]) {
    const monthsMap = new Map<string, number>();

    readings.forEach(reading => {
      const date = new Date(reading.getReadingDate());
      let month = date.toLocaleString('pt-BR', { month: 'long' });
      month = month[0].toUpperCase() + month.substring(1);
      const totalPages = reading.book.pages;
      const currentTotal = monthsMap.get(month) || 0;
      monthsMap.set(month, currentTotal + totalPages);
    });

    const months = Array.from(monthsMap.keys());
    const totalPages = Array.from(monthsMap.values());

    const existingChart = Chart.getChart("pagesMonth");
    if (existingChart) {
      existingChart.destroy();
    }


    new Chart("pagesMonth", {
      type: 'bar',
      data: {
        labels: months,
        datasets: [{
          label: 'Páginas',
          data: totalPages,
          backgroundColor: 'rgba(255, 140, 0, 1)',
          hoverBackgroundColor: 'rgb(244, 153, 36, 1)',
        }]
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: 'Páginas Lidas por Mês',
            padding: {
              bottom: 30
            }
          },
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              font: {
                size: 14
              }
            }
          }
        },
        locale: 'pt-BR',
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(102, 102, 102, 1)'
            },
            title: {
              display: true,
              text: 'Quantidade de Páginas Lidas'
            }
          },
          x: {
            reverse: true,
            grid: {
              color: 'rgba(102, 102, 102, 1)'
            },
            title: {
              display: true,
            }
          }
        }
      }
    });
  }

  chartRatingByGenre(readings: Reading[]) {

    const genresMap = new Map<string, { totalRating: number; count: number }>();

    readings.forEach(reading => {

      if (reading.book.genre) {
        let genreName = reading.book.genre.name;
        let rating = reading.rating;
        let genreData = genresMap.get(genreName) || { totalRating: 0, count: 0 };

        genreData.totalRating += rating;
        genreData.count++;

        genresMap.set(genreName, genreData);
      }

    });

    let genres = Array.from(genresMap.keys());

    let avgRatings = genres.map(genre => {
      let genreData = genresMap.get(genre);
      return genreData ? genreData.totalRating / genreData.count : 0;
    });

    const existingChart = Chart.getChart("ratingGenre");
    if (existingChart) {
      existingChart.destroy();
    }

    new Chart("ratingGenre", {
      type: 'bar',
      data: {
        labels: genres,
        datasets: [{
          label: 'Média',
          data: avgRatings,
          backgroundColor: 'rgba(255, 140, 0, 1)',
          hoverBackgroundColor: 'rgb(244, 153, 36, 1)',
        }]
      },
      options: {
        indexAxis: 'y',
        scales: {
          y: {
            type: 'category',
            labels: genres,
            grid: {
              color: 'rgba(102, 102, 102, 1)'
            },
            ticks: {
              callback: function (tickValue: string | number, index: number) {
                let value = genres[index];
                if (value.length > 15) {
                  return value.slice(0, 15) + '...';
                }
                return value;
              }
            }
          },
          x: {
            grid: {
              color: 'rgba(102, 102, 102, 1)'
            },
            ticks: {
              precision: 1,
            }
          }
        },

        responsive: true,

        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              font: {
                size: 14
              },
            }
          },
          title: {
            display: true,
            text: 'Avaliação Média por Gênero',
            padding: {
              top: 10,
              bottom: 30
            }
          }
        }
      }
    });
  }

  chartBooksByGenre(readings: Reading[]) {

    const genresMap = new Map<string, { books: number; }>();

    readings.forEach(reading => {

      if (reading.book.genre) {
        let genreName = reading.book.genre.name;
        let genreData = genresMap.get(genreName) || { books: 0 };
        genreData.books += 1;
        genresMap.set(genreName, genreData);
      }

    });

    let genres = Array.from(genresMap.keys());

    let books = genres.map(genre => {
      let genreData = genresMap.get(genre);
      return genreData ? genreData.books : 0;
    });

    const existingChart = Chart.getChart("readingsByGenre");
    if (existingChart) {
      existingChart.destroy();
    }

    var coloR = dynamicColors(genres.length);

    new Chart("readingsByGenre", {
      type: 'doughnut',
      data: {
        labels: genres,
        datasets: [{
          label: 'Livros',
          data: books,
          backgroundColor: coloR,
          hoverOffset: 4,
          borderColor: 'rgba(102, 102, 102, 1)',
          borderWidth: 0.5
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              font: {
                size: 14
              },
            }
          },
          title: {
            display: true,
            text: 'Leituras por Gênero',
            padding: {
              top: 10,
              bottom: 30
            }
          }
        }
      }
    });

  }

  countRatings(ratings: number[]): number[] {
    const ratingCounts = [0, 0, 0, 0, 0];
    ratings.forEach(rating => {
      ratingCounts[rating - 1]++;
    });
    return ratingCounts;
  }

  onYearSelected(year: string) {
    this.selectedYear = year;
    this.loadData();
    this.notificationService.simple('Ano Base alterado com sucesso!');
  }
}

function dynamicColors(colors: number): any {
  var coloR = [];
  for (let i = 0; i < colors; i++) {
    var r = Math.floor(Math.random() * 255);
    var g = Math.floor(Math.random() * 255);
    var b = Math.floor(Math.random() * 255);
    coloR.push("rgb(" + r + "," + g + "," + b + ")");
  }
  return coloR;
}

