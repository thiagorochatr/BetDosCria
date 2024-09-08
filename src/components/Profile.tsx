interface ProfileProps {
  name?: string;
  avatarUrl?: string;
  address: string;
  handleLogout: () => Promise<void>;
}

export function Profile(props: ProfileProps) {
  const walletMasked = formatWalletAddress(props.address[0]);
  return (
    <div className="flex items-center gap-3 text-right text-xs">
      <div className="flex flex-col">
        <p className="leading-snug">
          {props.name}
        </p>
        <span>{walletMasked}</span>
        <button
          onClick={props.handleLogout}
          className="text-right block text-slate-200 hover:text-red-300"
          >
          Logout
        </button>
      </div>
      <img src={props.avatarUrl} className="h-10 w-10 rounded-full" />
    </div>
  )
}

function formatWalletAddress(address: string): string {
    const prefix = address.slice(0, 4); // "0x" plus first two characters
    const suffix = address.slice(-4);   // Last four characters

    return `${prefix}...${suffix}`;
}
