import { defineConfig } from 'vite'
import monkey from 'vite-plugin-monkey'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const pkg = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf8'))

export default defineConfig({
  plugins: [
    monkey({
      entry: 'src/userscript/main.ts',
      userscript: {
        name: {
          '': 'LinkedIn Hide Viewed Jobs',
          tr: 'LinkedIn Goruntulenen Ilanlari Gizle',
          es: 'LinkedIn Ocultar Empleos Vistos',
          de: 'LinkedIn Angesehene Jobs Ausblenden',
          fr: 'LinkedIn Masquer Les Offres Consultees',
          pt: 'LinkedIn Ocultar Vagas Visualizadas',
          it: 'LinkedIn Nascondi Annunci Visualizzati',
          ru: 'LinkedIn Скрыть Просмотренные Вакансии',
          ja: 'LinkedIn 閲覧済み求人を非表示',
          ko: 'LinkedIn 확인한 채용 공고 숨기기',
          'zh-CN': 'LinkedIn 隐藏已查看职位',
          ar: 'لينكدإن إخفاء الوظائف التي تمت مشاهدتها'
        },
        namespace: 'https://github.com/sametcn99',
        version: pkg.version,
        description: {
          '': 'Hides viewed job cards on LinkedIn Jobs pages, adds a compact draggable badge, and lets you reveal hidden items anytime.',
          tr: 'LinkedIn is sayfalarinda goruntulenen ilan kartlarini gizler, suruklenebilir kompakt bir badge ekler ve gizlenenleri istedigin zaman geri gostermenizi saglar.',
          es: 'Oculta tarjetas de empleo vistas en LinkedIn Jobs, agrega una insignia compacta y arrastrable, y te permite mostrar los elementos ocultos cuando quieras.',
          de: 'Blendet angesehene Jobkarten auf LinkedIn Jobs aus, fuegt ein kompaktes verschiebbares Badge hinzu und laesst dich ausgeblendete Eintraege jederzeit wieder anzeigen.',
          fr: "Masque les fiches d'emploi consultees sur LinkedIn Jobs, ajoute un badge compact deplacable et vous permet de reafficher les elements masques a tout moment.",
          pt: 'Oculta cartoes de vagas visualizadas no LinkedIn Jobs, adiciona um selo compacto arrastavel e permite revelar itens ocultos a qualquer momento.',
          it: 'Nasconde le schede delle offerte gia visualizzate su LinkedIn Jobs, aggiunge un badge compatto trascinabile e consente di mostrare di nuovo gli elementi nascosti in qualsiasi momento.',
          ru: 'Скрывает просмотренные карточки вакансий в LinkedIn Jobs, добавляет компактный перетаскиваемый бейдж и позволяет в любой момент снова показать скрытые элементы.',
          ja: 'LinkedIn Jobsで閲覧済みの求人カードを非表示にし、コンパクトでドラッグ可能なバッジを追加して、非表示項目をいつでも再表示できます。',
          ko: 'LinkedIn Jobs 페이지에서 확인한 채용 카드들을 숨기고, 작고 드래그 가능한 배지를 추가하며, 숨긴 항목을 언제든 다시 표시할 수 있습니다.',
          'zh-CN':
            '在 LinkedIn 职位页面隐藏已查看职位卡片，添加可拖动的紧凑徽章，并可随时重新显示已隐藏项目。',
          ar: 'يخفي بطاقات الوظائف التي تمت مشاهدتها في صفحات وظائف لينكدإن، ويضيف شارة مدمجة قابلة للسحب، ويتيح لك إظهار العناصر المخفية في أي وقت.'
        },
        source: 'https://github.com/sametcn99/linkedin-hide-viewed-jobs',
        website: 'https://github.com/sametcn99/linkedin-hide-viewed-jobs',
        author: 'sametcn99',
        copyright: '2026, sametcn99',
        license: 'MIT',
        homepageURL: 'https://github.com/sametcn99/linkedin-hide-viewed-jobs',
        supportURL: 'https://github.com/sametcn99/linkedin-hide-viewed-jobs/issues',
        downloadURL:
          'https://raw.githubusercontent.com/sametcn99/linkedin-hide-viewed-jobs/main/linkedin-hide-viewed-jobs.user.js',
        updateURL:
          'https://raw.githubusercontent.com/sametcn99/linkedin-hide-viewed-jobs/main/linkedin-hide-viewed-jobs.user.js',
        icon: 'https://www.linkedin.com/favicon.ico',
        icon64: 'https://www.linkedin.com/favicon.ico',
        match: ['https://www.linkedin.com/*'],
        tag: ['linkedin', 'jobs', 'productivity', 'userscript', 'ui', 'filtering', 'linkedin-jobs'],
        homepage: 'https://github.com/sametcn99/linkedin-hide-viewed-jobs',
        'run-at': 'document-idle',
        grant: 'none',
        'inject-into': 'content',
        noframes: true,
        $extra: [
          ['compatible', ['chrome Violentmonkey/Tampermonkey']],
          ['compatible', ['edge Violentmonkey/Tampermonkey']],
          ['compatible', ['firefox Violentmonkey/Tampermonkey']]
        ]
      },
      build: {
        fileName: 'linkedin-hide-viewed-jobs.user.js'
      }
    })
  ],
  build: {
    outDir: 'dist/userscript',
    emptyOutDir: false,
    target: 'esnext',
    minify: 'terser',
    cssMinify: true,
    terserOptions: {
      ecma: 2020,
      module: true,
      parse: {
        html5_comments: false,
        shebang: false
      },
      compress: {
        arrows: true,
        booleans_as_integers: true,
        booleans: true,
        collapse_vars: true,
        comparisons: true,
        computed_props: true,
        conditionals: true,
        dead_code: true,
        drop_console: true,
        drop_debugger: true,
        evaluate: true,
        hoist_funs: true,
        hoist_props: true,
        hoist_vars: true,
        if_return: true,
        inline: 3,
        join_vars: true,
        keep_fargs: false,
        loops: true,
        module: true,
        passes: 5,
        pure_getters: true,
        pure_funcs: ['console.debug', 'console.info', 'console.log', 'console.warn'],
        reduce_funcs: true,
        reduce_vars: true,
        sequences: true,
        side_effects: true,
        switches: true,
        toplevel: true,
        typeofs: true,
        unsafe: true,
        unsafe_arrows: true,
        unsafe_comps: true,
        unsafe_math: true,
        unsafe_methods: true,
        unsafe_symbols: true,
        unsafe_undefined: true,
        unused: true
      },
      mangle: {
        eval: true,
        module: true,
        properties: {
          regex:
            /^(?:showHidden|scrollGuardEnabled|detectionMode|reloadOnNavigationEnabled|highlightColors|highlightOpacity|hiddenCount|rafId|isRuntimeActive|isReloadingForPathChange|lastRouteChangeAt|isCooldownActive|cooldownUntil|lastControlledScrollAt|touchLastY|lastObservedScrollY|lastObservedScrollAt|isAdjustingNativeScroll|countGrowthSinceCooldown|isDragging|styleEl|normalizedViewedKeywords|normalizedAppliedKeywords|lastUrl|lastPathname|routeRefreshBurstId|domObserver|domMutationTimerId|delayedRefreshTimers)$/
        },
        toplevel: true
      },
      format: {
        ascii_only: true,
        comments: false,
        semicolons: false,
        wrap_iife: true
      }
    }
  }
})
