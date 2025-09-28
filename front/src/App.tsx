import { useState } from "react";
import svgPaths from "./imports/svg-k0xavuma2y";
import imgEthIcon from "figma:asset/e0462ae91ad6c89c3a1b6ef05c14ed6beb477985.png";
import aqualiLogo from './assets/aquali.png';
import { LiquidityPage } from "./components/LiquidityPage";
import { WalletConnector } from "./components/WalletConnector";
import { CetusSwapPage } from "./components/CetusSwapPage";

function Margin() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start pl-[36px] pr-0 py-0 relative shrink-0"
      data-name="Margin"
    >
      <div className="flex flex-col justify-center items-start relative shrink-0">
        <img 
          src={aqualiLogo} 
          alt="AQUALI Logo" 
          className="h-[40px] w-auto object-contain"
        />
      </div>
    </div>
  );
}



function Container() {
  return (
    <div
      className="content-stretch flex gap-[4px] items-center relative shrink-0"
      data-name="Container"
    >
      <Margin />
    </div>
  );
}

function Container1() {
  return (
    <div
      className="basis-0 grow min-h-px min-w-px relative shrink-0"
      data-name="Container"
    >
      <div className="flex flex-row items-center relative size-full">
        <div className="box-border content-stretch flex items-center pl-[8px] pr-[429.91px] py-0 relative w-full">
          <Container />
        </div>
      </div>
    </div>
  );
}

function Link({
  currentPage,
  setCurrentPage,
}: {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}) {
  return (
    <div
      className="content-stretch flex items-start relative shrink-0 cursor-pointer"
      data-name="Link"
      onClick={() => setCurrentPage("swap")}
    >
      <div
        className={`flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[15.375px] text-nowrap ${currentPage === "swap" ? "text-white" : "text-gray-400"}`}
      >
        <p className="leading-[24px] whitespace-pre">Swap</p>
      </div>
    </div>
  );
}

function Item({
  currentPage,
  setCurrentPage,
}: {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}) {
  return (
    <div
      className="content-stretch flex flex-col items-start relative self-stretch shrink-0"
      data-name="Item"
    >
      <Link
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
    </div>
  );
}

function Link1({
  currentPage,
  setCurrentPage,
}: {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}) {
  return (
    <div
      className="content-stretch flex items-start relative shrink-0 cursor-pointer"
      data-name="Link"
      onClick={() => setCurrentPage("liquidity")}
    >
      <div
        className={`flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[15.5px] text-nowrap ${currentPage === "liquidity" ? "text-white" : "text-gray-400"}`}
      >
        <p className="leading-[24px] whitespace-pre">
          Liquidity
        </p>
      </div>
    </div>
  );
}

function Item1({
  currentPage,
  setCurrentPage,
}: {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}) {
  return (
    <div
      className="content-stretch flex flex-col h-[24px] items-start relative shrink-0"
      data-name="Item"
    >
      <Link1
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
    </div>
  );
}

function ItemMargin({
  currentPage,
  setCurrentPage,
}: {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}) {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-center pl-[32px] pr-0 py-0 relative self-stretch shrink-0"
      data-name="Item:margin"
    >
      <Item1
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
    </div>
  );
}

function Link2() {
  return (
    <div
      className="content-stretch flex items-start relative shrink-0"
      data-name="Link"
    >
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[15.5px] text-gray-400 text-nowrap">
        <p className="leading-[24px] whitespace-pre">
          Dashboard
        </p>
      </div>
    </div>
  );
}

function Item2() {
  return (
    <div
      className="content-stretch flex flex-col h-[24px] items-start relative shrink-0"
      data-name="Item"
    >
      <Link2 />
    </div>
  );
}

function ItemMargin1() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-center pl-[32px] pr-0 py-0 relative self-stretch shrink-0"
      data-name="Item:margin"
    >
      <Item2 />
    </div>
  );
}



function List({
  currentPage,
  setCurrentPage,
}: {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}) {
  return (
    <div
      className="content-stretch flex items-start relative shrink-0"
      data-name="List"
    >
      <Item
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
      <ItemMargin
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
      <ItemMargin1 />
    </div>
  );
}

function Nav({
  currentPage,
  setCurrentPage,
}: {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}) {
  return (
    <div
      className="content-stretch flex flex-col items-start relative shrink-0"
      data-name="Nav"
    >
      <List
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
    </div>
  );
}

function OverlayBlur({
  currentPage,
  setCurrentPage,
}: {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}) {
  return (
    <div
      className="backdrop-blur-sm backdrop-filter box-border content-stretch flex items-center px-[32px] py-[16px] relative rounded-[9999px] shrink-0"
      data-name="OverlayBlur"
    >
      <Nav
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
      <div
        className="absolute bg-gradient-to-r from-[rgba(79,70,229,0)] h-px left-[40px] opacity-0 to-[rgba(79,70,229,0)] top-[-1px] via-50% via-[rgba(79,70,229,0.8)] w-[300.52px]"
        data-name="Horizontal Divider"
      />
      <div
        className="absolute bg-gradient-to-r from-[rgba(165,180,252,0)] h-px left-[44.83%] mix-blend-overlay opacity-0 right-[45.17%] to-[rgba(165,180,252,0)] top-[-1px] via-50% via-[rgba(165,180,252,0.5)]"
        data-name="Horizontal Divider"
      />
    </div>
  );
}



function Container2() {
  return (
    <div
      className="basis-0 content-stretch flex grow items-center justify-end min-h-px min-w-px relative shrink-0"
      data-name="Container"
    >
      <WalletConnector />
    </div>
  );
}

function Container3({
  currentPage,
  setCurrentPage,
}: {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}) {
  return (
    <div
      className="content-stretch flex items-center justify-between relative shrink-0 w-full bg-[rgba(67,90,390,0)]"
      data-name="Container"
    >
      <Container1 />
      <OverlayBlur
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
      <Container2 />
    </div>
  );
}

function AppHeader({
  currentPage,
  setCurrentPage,
}: {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}) {
  return (
    <div
      className="shrink-0 sticky top-0 w-full bg-transparent backdrop-blur-sm z-30"
      data-name="app-header"
    >
      <div className="relative size-full">
        {/* Dégradé d'accentuation subtil */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[rgba(99,102,241,0.03)] to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(59,130,246,0.05)] via-transparent to-transparent" />
        
        <div className="box-border content-stretch flex flex-col items-start px-[32px] py-[16px] relative w-full z-10">
          <Container3
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
}

function Tab() {
  return (
    <div
      className="bg-[rgba(156,163,175,0.2)] box-border content-stretch flex flex-col items-center justify-center px-[16px] py-[8px] relative rounded-[9999px] shrink-0"
      data-name="Tab"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16.875px] text-center text-nowrap text-white">
        <p className="leading-[28px] whitespace-pre">Swap</p>
      </div>
    </div>
  );
}

function Tab1() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-center justify-center px-[16px] py-[8px] relative rounded-[9999px] shrink-0"
      data-name="Tab"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[17.156px] text-center text-gray-400 text-nowrap">
        <p className="leading-[28px] whitespace-pre">Bridge</p>
      </div>
    </div>
  );
}

function NavTabs() {
  return (
    <div
      className="content-stretch flex gap-[6px] items-start relative shrink-0"
      data-name="Nav - Tabs"
    >
      <Tab />
      <Tab1 />
    </div>
  );
}

function Container4() {
  return (
    <div
      className="content-stretch flex flex-col items-start relative shrink-0"
      data-name="Container"
    >
      <NavTabs />
    </div>
  );
}

function Svg1() {
  return (
    <div
      className="relative shrink-0 size-[20px]"
      data-name="SVG"
    >
      <svg
        className="block size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 20 20"
      >
        <g id="SVG">
          <path
            clipRule="evenodd"
            d={svgPaths.p38e52ac0}
            fill="var(--fill-0, #9CA3AF)"
            fillRule="evenodd"
            id="Vector"
          />
        </g>
      </svg>
    </div>
  );
}

function AppSettingsDropdownButton() {
  return (
    <div
      className="box-border content-stretch flex items-center px-[8px] py-[6px] relative rounded-[9999px] shrink-0"
      data-name="app-settings-dropdown → Button"
    >
      <Svg1 />
    </div>
  );
}

function Container5() {
  return (
    <div
      className="content-stretch flex flex-col items-start relative shrink-0"
      data-name="Container"
    >
      <AppSettingsDropdownButton />
    </div>
  );
}

function Container6() {
  return (
    <div
      className="box-border content-stretch flex items-center justify-between pb-[12px] pt-0 px-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Container4 />
      <Container5 />
    </div>
  );
}

function Container7() {
  return (
    <div
      className="absolute content-stretch flex flex-col items-start left-[16px] right-[16px] top-[16px]"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[13.891px] text-gray-400 text-nowrap">
        <p className="leading-[20px] whitespace-pre">Sell</p>
      </div>
    </div>
  );
}

function Small() {
  return (
    <div
      className="h-[20px] shrink-0 w-[3.2px]"
      data-name="Small"
    />
  );
}

function Container8() {
  return (
    <div
      className="absolute content-stretch flex items-center justify-between left-[16px] right-[16px] top-[94.5px]"
      data-name="Container"
    >
      {[...Array(2).keys()].map((_, i) => (
        <Small key={i} />
      ))}
    </div>
  );
}

function Svg2() {
  return (
    <div
      className="absolute h-[180.5px] left-[-25px] top-[-25px] w-[530px]"
      data-name="SVG"
    >
      <svg
        className="block size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 530 181"
      >
        <g id="SVG">
          <g id="Vector"></g>
          <path
            d="M118 24H48V25H118V24Z"
            fill="url(#paint0_linear_1_372)"
            id="Vector_2"
          />
        </g>
        <defs>
          <linearGradient
            gradientUnits="userSpaceOnUse"
            id="paint0_linear_1_372"
            x1="48"
            x2="118"
            y1="24"
            y2="24"
          >
            <stop stopColor="white" stopOpacity="0" />
            <stop
              offset="0.4"
              stopColor="#8ADAFF"
              stopOpacity="0.8"
            />
            <stop
              offset="0.5"
              stopColor="#8ADAFF"
              stopOpacity="0.8"
            />
            <stop
              offset="1"
              stopColor="white"
              stopOpacity="0"
            />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function Container9() {
  return (
    <div
      className="content-stretch flex flex-col items-start overflow-clip relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[36px] text-gray-500 w-full">
        <input 
          type="number" 
          placeholder="0" 
          className="leading-[normal] bg-transparent border-none outline-none text-[36px] text-gray-500 w-full placeholder-gray-500"
          min="0"
          step="any"
        />
      </div>
    </div>
  );
}

function Input() {
  return (
    <div
      className="basis-0 grow min-h-px min-w-px relative rounded-[8px] shrink-0"
      data-name="Input"
    >
      <div className="overflow-clip relative size-full">
        <div className="box-border content-stretch flex flex-col items-start pl-0 pr-[12px] py-0 relative w-full">
          <Container9 />
        </div>
      </div>
    </div>
  );
}

function Container10({ selectedSellToken }: { selectedSellToken: Token | null }) {
  return (
    <div
      className="content-stretch flex flex-col items-center relative shrink-0"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-center text-gray-400 text-nowrap">
        <p className="leading-[16px] whitespace-pre">{selectedSellToken ? selectedSellToken.symbol : "Select token"}</p>
      </div>
    </div>
  );
}

function Margin1({ selectedSellToken }: { selectedSellToken: Token | null }) {
  return (
    <div
      className="absolute box-border content-stretch flex flex-col items-start left-[32px] px-[8px] py-0 top-[8px]"
      data-name="Margin"
    >
      <Container10 selectedSellToken={selectedSellToken} />
    </div>
  );
}

function Svg3() {
  return (
    <div
      className="size-[20px]"
      data-name="SVG"
    >
      <svg
        className="block size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 20 20"
      >
        <g id="SVG">
          <path
            clipRule="evenodd"
            d={svgPaths.p26e2b7f0}
            fill="var(--fill-0, white)"
            fillRule="evenodd"
            id="Vector"
          />
        </g>
      </svg>
    </div>
  );
}

function EthIcon() {
  return null;
}

function AppTokenIcon({ selectedSellToken }: { selectedSellToken: Token | null }) {
  return (
    <div
      className="absolute content-stretch flex flex-col items-start left-0 top-1/2 translate-y-[-50%]"
      data-name="app-token-icon"
    >
      {selectedSellToken ? null : (
        <EthIcon />
      )}
    </div>
  );
}

function Container11({ selectedSellToken, onOpenSellTokenSelector }: { selectedSellToken: Token | null; onOpenSellTokenSelector: () => void }) {
  return (
    <div
      className="box-border content-stretch flex gap-[4px] h-[32px] items-center px-[12px] py-0 relative shrink-0 cursor-pointer"
      data-name="Container"
      onClick={onOpenSellTokenSelector}
    >
      <Container10 selectedSellToken={selectedSellToken} />
      <Svg3 />
    </div>
  );
}

function Button1({ selectedSellToken, onOpenSellTokenSelector }: { selectedSellToken: Token | null; onOpenSellTokenSelector: () => void }) {
  return (
    <div
      className={`content-stretch flex items-center relative rounded-[9999px] shrink-0 ${selectedSellToken ? 'bg-gray-950 border border-[rgba(156,163,175,0.2)]' : 'bg-indigo-600'}`}
      data-name="Button"
    >
      <Container11 selectedSellToken={selectedSellToken} onOpenSellTokenSelector={onOpenSellTokenSelector} />
    </div>
  );
}

function Container12({ selectedSellToken, onOpenSellTokenSelector }: { selectedSellToken: Token | null; onOpenSellTokenSelector: () => void }) {
  return (
    <div
      className="absolute content-stretch flex items-center justify-between left-[16px] right-[16px] top-[44px]"
      data-name="Container"
    >
      <Input />
      <Button1 selectedSellToken={selectedSellToken} onOpenSellTokenSelector={onOpenSellTokenSelector} />
    </div>
  );
}

function AppTokenInput({ selectedSellToken, onOpenSellTokenSelector }: { selectedSellToken: Token | null; onOpenSellTokenSelector: () => void }) {
  return (
    <div
      className="bg-[rgba(156,163,175,0.1)] h-[130.5px] overflow-clip relative rounded-[12px] shadow-[0px_0px_0px_1px_rgba(243,244,246,0.1)] shrink-0 w-full"
      data-name="app-token-input"
    >
      <Container7 />
      <Container8 />
      <Svg2 />
      <Container12 selectedSellToken={selectedSellToken} onOpenSellTokenSelector={onOpenSellTokenSelector} />
    </div>
  );
}

function Svg4() {
  return (
    <div
      className="relative shrink-0 size-[20px]"
      data-name="SVG"
    >
      <svg
        className="block size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 20 20"
      >
        <g id="SVG">
          {/* Top curved arrow - going right and down */}
          <path
            d="M3 5 Q 10 2 15 8"
            stroke="#E5E7EB"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
          {/* Arrow head for top arrow */}
          <path
            d="M13 6 L15 8 L13 10"
            stroke="#E5E7EB"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          
          {/* Bottom curved arrow - going left and up */}
          <path
            d="M17 15 Q 10 18 5 12"
            stroke="#E5E7EB"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
          {/* Arrow head for bottom arrow */}
          <path
            d="M7 14 L5 12 L7 10"
            stroke="#E5E7EB"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </g>
      </svg>
    </div>
  );
}

function Button2({ onSwapTokens }: { onSwapTokens: () => void }) {
  return (
    <div
      className="bg-gray-950 box-border content-stretch flex flex-col items-start p-[8px] relative rounded-[12px] shrink-0 cursor-pointer hover:bg-gray-800 transition-colors"
      data-name="Button"
      onClick={onSwapTokens}
    >
      <Svg4 />
    </div>
  );
}

function Container13({ onSwapTokens }: { onSwapTokens: () => void }) {
  return (
    <div
      className="content-stretch flex h-[4px] items-center justify-center relative shrink-0 w-full"
      data-name="Container"
    >
      <Button2 onSwapTokens={onSwapTokens} />
    </div>
  );
}

function Container14() {
  return (
    <div
      className="content-stretch flex flex-col items-start relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[13.781px] text-gray-400 w-full">
        <p className="leading-[20px]">Buy</p>
      </div>
    </div>
  );
}

function Container15() {
  return (
    <div
      className="content-stretch flex flex-col items-start overflow-clip relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[36px] text-gray-500 w-full">
        <input 
          type="number" 
          placeholder="0" 
          className="leading-[normal] bg-transparent border-none outline-none text-[36px] text-gray-500 w-full placeholder-gray-500"
          min="0"
          step="any"
        />
      </div>
    </div>
  );
}

function Input1() {
  return (
    <div
      className="basis-0 grow min-h-px min-w-px relative rounded-[8px] shrink-0"
      data-name="Input"
    >
      <div className="overflow-clip relative size-full">
        <div className="box-border content-stretch flex flex-col items-start pl-0 pr-[12px] py-0 relative w-full">
          <Container15 />
        </div>
      </div>
    </div>
  );
}

function Container16({ selectedToken }: { selectedToken: Token | null }) {
  return (
    <div
      className="content-stretch flex flex-col items-center relative shrink-0"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-center text-gray-400 text-nowrap">
        <p className="leading-[16px] whitespace-pre">{selectedToken ? selectedToken.symbol : "Select token"}</p>
      </div>
    </div>
  );
}

function Svg5() {
  return (
    <div
      className="size-[20px]"
      data-name="SVG"
    >
      <svg
        className="block size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 20 20"
      >
        <g id="SVG">
          <path
            clipRule="evenodd"
            d={svgPaths.p26e2b7f0}
            fill="var(--fill-0, white)"
            fillRule="evenodd"
            id="Vector"
          />
        </g>
      </svg>
    </div>
  );
}

function Container17({ selectedToken, onOpenTokenSelector }: { selectedToken: Token | null; onOpenTokenSelector: () => void }) {
  return (
    <div
      className="box-border content-stretch flex gap-[4px] h-[32px] items-center px-[12px] py-0 relative shrink-0 cursor-pointer"
      data-name="Container"
      onClick={onOpenTokenSelector}
    >
      <Container16 selectedToken={selectedToken} />
      <Svg5 />
    </div>
  );
}

function Button3({ selectedToken, onOpenTokenSelector }: { selectedToken: Token | null; onOpenTokenSelector: () => void }) {
  return (
    <div
      className={`content-stretch flex items-center relative rounded-[9999px] shrink-0 ${selectedToken ? 'bg-gray-950 border border-[rgba(156,163,175,0.2)]' : 'bg-indigo-600'}`}
      data-name="Button"
    >
      <Container17 selectedToken={selectedToken} onOpenTokenSelector={onOpenTokenSelector} />
    </div>
  );
}

function Container18({ selectedToken, onOpenTokenSelector }: { selectedToken: Token | null; onOpenTokenSelector: () => void }) {
  return (
    <div
      className="content-stretch flex items-center justify-between relative shrink-0 w-full"
      data-name="Container"
    >
      <Input1 />
      <Button3 selectedToken={selectedToken} onOpenTokenSelector={onOpenTokenSelector} />
    </div>
  );
}

function Small2() {
  return (
    <div
      className="h-[20px] shrink-0 w-[3.2px]"
      data-name="Small"
    />
  );
}

function Container19() {
  return (
    <div
      className="relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-row items-center relative size-full">
        <div className="content-stretch flex items-center justify-between relative w-full">
          {[...Array(2).keys()].map((_, i) => (
            <Small2 key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

function AppTokenInput1({ selectedToken, onOpenTokenSelector }: { selectedToken: Token | null; onOpenTokenSelector: () => void }) {
  return (
    <div
      className="bg-[rgba(156,163,175,0.1)] relative rounded-[12px] shadow-[0px_0px_0px_1px_rgba(243,244,246,0.1)] shrink-0 w-full"
      data-name="app-token-input"
    >
      <div className="overflow-clip relative size-full">
        <div className="box-border content-stretch flex flex-col gap-[8px] items-start p-[16px] relative w-full">
          <Container14 />
          <Container18 selectedToken={selectedToken} onOpenTokenSelector={onOpenTokenSelector} />
          <Container19 />
        </div>
      </div>
    </div>
  );
}

function Container20({ selectedToken, onOpenTokenSelector, selectedSellToken, onOpenSellTokenSelector, onSwapTokens }: { selectedToken: Token | null; onOpenTokenSelector: () => void; selectedSellToken: Token | null; onOpenSellTokenSelector: () => void; onSwapTokens: () => void }) {
  return (
    <div
      className="content-stretch flex flex-col gap-px items-start relative shrink-0 w-full"
      data-name="Container"
    >
      <AppTokenInput selectedSellToken={selectedSellToken} onOpenSellTokenSelector={onOpenSellTokenSelector} />
      <Container13 onSwapTokens={onSwapTokens} />
      <AppTokenInput1 selectedToken={selectedToken} onOpenTokenSelector={onOpenTokenSelector} />
    </div>
  );
}

function AppConnectWalletButtonButton() {
  return (
    <div
      className="bg-indigo-600 h-[56px] relative rounded-[12px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] shrink-0 w-full"
      data-name="app-connect-wallet-button → Button"
    >
      <div className="flex flex-row items-center justify-center relative size-full">
        <div className="box-border content-stretch flex h-[56px] items-center justify-center px-[16px] py-[8px] relative w-full">
          <div className="basis-0 flex flex-col font-['Inter:Medium',_sans-serif] font-medium grow justify-center leading-[0] min-h-px min-w-px not-italic relative shrink-0 text-[15.5px] text-center text-white">
            <p className="leading-[24px]">Connect</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AppUniversalRouter({ selectedToken, onOpenTokenSelector, selectedSellToken, onOpenSellTokenSelector, onSwapTokens }: { selectedToken: Token | null; onOpenTokenSelector: () => void; selectedSellToken: Token | null; onOpenSellTokenSelector: () => void; onSwapTokens: () => void }) {
  return (
    <div
      className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-full"
      data-name="app-universal-router"
    >
      <Container20 selectedToken={selectedToken} onOpenTokenSelector={onOpenTokenSelector} selectedSellToken={selectedSellToken} onOpenSellTokenSelector={onOpenSellTokenSelector} onSwapTokens={onSwapTokens} />
      <AppConnectWalletButtonButton />
    </div>
  );
}

function Container21({ selectedToken, onOpenTokenSelector, selectedSellToken, onOpenSellTokenSelector, onSwapTokens }: { selectedToken: Token | null; onOpenTokenSelector: () => void; selectedSellToken: Token | null; onOpenSellTokenSelector: () => void; onSwapTokens: () => void }) {
  return (
    <div
      className="content-stretch flex flex-col items-start relative shrink-0 w-full"
      data-name="Container"
    >
      <Container6 />
      <AppUniversalRouter selectedToken={selectedToken} onOpenTokenSelector={onOpenTokenSelector} selectedSellToken={selectedSellToken} onOpenSellTokenSelector={onOpenSellTokenSelector} onSwapTokens={onSwapTokens} />
    </div>
  );
}

function Container22({ selectedToken, onOpenTokenSelector, selectedSellToken, onOpenSellTokenSelector, onSwapTokens }: { selectedToken: Token | null; onOpenTokenSelector: () => void; selectedSellToken: Token | null; onOpenSellTokenSelector: () => void; onSwapTokens: () => void }) {
  return (
    <div
      className="content-stretch flex flex-col items-start max-w-[480px] relative shrink-0 w-full"
      data-name="Container"
    >
      <Container21 selectedToken={selectedToken} onOpenTokenSelector={onOpenTokenSelector} selectedSellToken={selectedSellToken} onOpenSellTokenSelector={onOpenSellTokenSelector} onSwapTokens={onSwapTokens} />
    </div>
  );
}

function AppSwapStandalone({ selectedToken, onOpenTokenSelector, selectedSellToken, onOpenSellTokenSelector, onSwapTokens }: { selectedToken: Token | null; onOpenTokenSelector: () => void; selectedSellToken: Token | null; onOpenSellTokenSelector: () => void; onSwapTokens: () => void }) {
  return (
    <div
      className="bg-gray-950 min-h-[calc(100vh-80px)] relative shrink-0 w-full flex-1"
      data-name="app-swap-standalone"
    >
      <div className="flex flex-col items-center min-h-full relative w-full px-6 pt-24 pb-12">
        <Container22 selectedToken={selectedToken} onOpenTokenSelector={onOpenTokenSelector} selectedSellToken={selectedSellToken} onOpenSellTokenSelector={onOpenSellTokenSelector} onSwapTokens={onSwapTokens} />
      </div>
    </div>
  );
}

export default function App() {
  const [currentPage, setCurrentPage] = useState("swap");

  return (
    <div
      className="bg-gray-950 content-stretch flex flex-col items-start relative min-h-screen w-full"
      data-name="app-root → Html"
    >
      <AppHeader
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
      {currentPage === "swap" ? (
        <CetusSwapPage />
      ) : (
        <LiquidityPage />
      )}
    </div>
  );
}