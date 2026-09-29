import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, inject, signal } from '@angular/core';

interface Pacote {
  nome: string;
  tag: string;
  msg: string;
  img: string;
  desc: string;
  itens: string[];
  destaque: boolean;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements AfterViewInit, OnDestroy {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private observer?: IntersectionObserver;

  private readonly whatsappNumero = '553497759161';
  private readonly mensagemPadrao = 'Olá! Vim pelo site e gostaria de um orçamento com o Prime Buffet.';

  protected readonly instagram = 'https://instagram.com/primebuffetgourmet';
  protected readonly perfil = '@primebuffetgourmet';
  protected readonly threads = 'https://www.threads.com/@primebuffetgourmet';
  protected readonly waLink = this.wa(this.mensagemPadrao);
  protected readonly ano = new Date().getFullYear();

  protected readonly navSolido = signal(false);
  protected readonly galeriaPausada = signal(false);

  protected readonly pacotes: (Pacote & { link: string })[] = [
    {
      nome: 'Essencial',
      tag: 'Até 50 pessoas',
      msg: 'Olá! Vi o pacote Essencial no site do Prime Buffet e gostaria de um orçamento para um evento de até 50 pessoas. Data prevista: ___',
      img: 'assets/galeria/galeria9.png',
      desc: 'Ideal para aniversários e reuniões mais intimistas.',
      itens: ['Mesa de frios e pães', 'Salgados variados', 'Bebidas não alcoólicas', 'Montagem e recolhimento'],
      destaque: false,
    },
    {
      nome: 'Prime',
      tag: 'Mais pedido',
      msg: 'Olá! Tenho interesse no pacote Prime (frios, frutas, pratos quentes e garçons). Pode me enviar um orçamento? Data e nº de convidados: ___',
      img: 'assets/galeria/galeria10.png',
      desc: 'O equilíbrio perfeito entre fartura e sofisticação.',
      itens: ['Mesa de frios, frutas e castanhas', 'Pratos quentes servidos em réchaud', 'Bebidas e sucos naturais', 'Equipe de garçons'],
      destaque: true,
    },
    {
      nome: 'Gourmet',
      tag: 'Casamentos',
      msg: 'Olá! Vou me casar e quero saber mais sobre o pacote Gourmet do Prime Buffet, incluindo a degustação. Data do casamento: ___',
      img: 'assets/galeria/galeria7.png',
      desc: 'Experiência completa para o grande dia.',
      itens: ['Cardápio personalizado com degustação', 'Mesa de frutas decorada', 'Jantar completo e sobremesas', 'Coordenação do serviço'],
      destaque: false,
    },
  ].map((p) => ({ ...p, link: this.wa(p.msg) }));

  protected readonly galeria = Array.from({ length: 10 }, (_, i) => `assets/galeria/galeria${i + 1}.png`);

  protected readonly numeros = [
    { alvo: 10, sufixo: '', label: 'anos de experiência' },
    { alvo: 300, sufixo: '', label: 'casamentos realizados' },
    { alvo: 50, sufixo: ' mil', label: 'convidados servidos' },
  ];
  protected readonly contagem = signal(this.numeros.map(() => 0));

  protected readonly depoimentos = [
    { texto: 'A mesa estava linda e a comida impecável. Os convidados elogiam até hoje.', nome: 'Juliana & Rafael', evento: 'Casamento' },
    { texto: 'Atendimento atencioso do primeiro contato até o fim da festa. Não precisei me preocupar com nada.', nome: 'Cláudia M.', evento: 'Aniversário' },
    { texto: 'Superou as expectativas da nossa equipe. Pontualidade e muito capricho.', nome: 'Marcos T.', evento: 'Evento corporativo' },
  ];

  @HostListener('window:scroll')
  protected onScroll(): void {
    const hero = document.getElementById('topo');
    const limite = hero ? hero.offsetHeight - 70 : 400;
    this.navSolido.set(window.scrollY > limite);
  }

  // Animações de entrada ao rolar: cada [data-reveal] ganha .is-visible quando aparece na tela
  ngAfterViewInit(): void {
    const els = this.elementRef.nativeElement.querySelectorAll<HTMLElement>('[data-reveal]');
    const semMovimento = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

    if (semMovimento || !('IntersectionObserver' in window)) {
      els.forEach((el) => this.revelar(el, true));
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          this.revelar(entry.target as HTMLElement, false);
          this.observer?.unobserve(entry.target);
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
    );
    els.forEach((el) => this.observer?.observe(el));
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  private revelar(el: HTMLElement, imediato: boolean): void {
    el.classList.add('is-visible');
    if (el.hasAttribute('data-contar')) this.contarNumeros(imediato ? 0 : 1800);
  }

  // Faz os números da seção Sobre subirem de 0 até o valor final
  private contarNumeros(duracao: number): void {
    const alvos = this.numeros.map((n) => n.alvo);
    if (duracao === 0) {
      this.contagem.set(alvos);
      return;
    }
    const inicio = performance.now();
    const passo = (agora: number) => {
      const t = Math.min((agora - inicio) / duracao, 1);
      const suave = 1 - Math.pow(1 - t, 3);
      this.contagem.set(alvos.map((a) => Math.round(a * suave)));
      if (t < 1) requestAnimationFrame(passo);
    };
    requestAnimationFrame(passo);
  }

  private wa(mensagem: string): string {
    return `https://wa.me/${this.whatsappNumero}?text=${encodeURIComponent(mensagem)}`;
  }
}
