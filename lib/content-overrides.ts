import type { SiteContent } from "./content-types";

export function applyContentOverrides(content: SiteContent): SiteContent {
  return {
    ...content,
    settings: {
      ...content.settings,
      logoPrimary: "/media/logo-lksa-transparent.png",
      address: "Jl. Veteran No.118 / 34 A, Kb. Pisang, Kec. Sumur Bandung, Kota Bandung, Jawa Barat 40112",
      phone: "+62 22 4210572",
    },
    articles: [
      ...content.articles,
      {
        id: "article-rotimu",
        title: "RotiMu: Ikhtiar Kemandirian dan Pemberdayaan Anak Asuh",
        slug: "rotimu-kemandirian-panti-asuhan",
        excerpt: "RotiMu menjadi usaha kreatif LKSA Muhammadiyah Sumur Bandung untuk mendukung kemandirian lembaga dan keterampilan anak asuh.",
        coverUrl: "/media/kunjungan-donatur.jpeg",
        body: "RotiMu adalah usaha ekonomi produktif LKSA Muhammadiyah Sumur Bandung yang dikembangkan untuk mendukung kemandirian panti dan pemberdayaan anak-anak asuh. Anak-anak dikenalkan pada proses produksi, penjualan, dan keterampilan yang dapat menjadi bekal setelah menyelesaikan masa pengasuhan.\n\nInformasi ini bersumber dari video resmi LKSA Muhammadiyah Sumur Bandung berjudul Transformasi RotiMu: Inovasi Muhammadiyah Social Fund. Saksikan video lengkapnya melalui kanal resmi kami.",
        publishDate: "2024-11-16",
        status: "published",
        featured: true,
        updatedAt: "2026-09-16",
      },
    ],
    documents: [
      { id: "doc-sertifikat", title: "Sertifikat Daftar Ulang Yayasan LKSA 2026", description: "Dokumen penetapan terdaftar lembaga kesejahteraan sosial.", href: "/documents/sertifikat-daftar-ulang-lksa-2026.pdf", category: "legalitas", published: true },
      { id: "doc-profil", title: "Profil Panti Asuhan", description: "Profil dan informasi kelembagaan LKSA.", href: "/documents/profil-panti-asuhan.pdf", category: "profil", published: true },
      { id: "doc-pendirian", title: "SK Pendirian AUM LKSA", description: "Surat keputusan pendirian Amal Usaha Muhammadiyah LKSA.", href: "/documents/sk-pendirian-aum-lksa.pdf", category: "legalitas", published: true },
      { id: "doc-struktur", title: "SK Struktur Organisasi Pengurus LKSA", description: "Surat keputusan struktur organisasi pengurus LKSA.", href: "/documents/sk-struktur-organisasi-pengurus-lksa.pdf", category: "organisasi", published: true },
    ],
    donation: {
      ...content.donation,
      heading: "Dukung Pengasuhan dan Pendidikan Anak",
      description: "Donasi Anda membantu kebutuhan pendidikan, pembinaan Al-Qur'an, kesehatan, dan pengasuhan anak-anak LKSA.",
      bankName: "BANK MANDIRI - KC BANDUNG SURAPATI",
      accountNumber: "131-00-1673433-3",
      accountHolder: "Yayasan Panti Asuhan Muhammadiyah",
      confirmationMessage: "Assalamu'alaikum, saya sudah melakukan donasi untuk LKSA Panti Asuhan Muhammadiyah Sumur Bandung dan ingin melakukan konfirmasi.",
      confirmationWhatsapp: "6281223823617",
      transparencyHeading: "Transparansi dan Legalitas Donasi",
    },
  };
}
