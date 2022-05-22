import Image from "next/image"
import starEmpty from '../assets/star.svg'
import starHalf from '../assets/star-half.svg'
import starFull from '../assets/star-fill.svg'

export const formattedDate = (timestamp: number) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const mm = new Date(timestamp).getMonth();
    const dd = new Date(timestamp).getDate();
    const yyyy = new Date(timestamp).getFullYear();
    const currentYear = new Date(Date.now()).getFullYear();
    return currentYear == yyyy ? `${months[mm]} ${dd}` : `${months[mm]} ${dd}, ${yyyy}`
  }

  export const formattedRating = (rating: number) => {
    const empty = <Image src={starEmpty} width={14} height={14} style={{ opacity: 0.5,paddingLeft: 2, marginRight: 2 }} alt="empty star" />
    const half = <Image src={starHalf} width={14} height={14}  style={{ opacity: 0.5,paddingLeft: 2, marginRight: 2 }} alt="half full star" />
    const full = <Image src={starFull} width={14} height={14}  style={{ opacity: 0.5, paddingLeft: 2, marginRight: 2 }} alt="full star" />
    const slots = [2,4,6,8,10];
    return (
      <span style={{ color: "#666!important" }}>
        {slots.map(s => {
          if (rating >= s) { return full; }
          if (rating == s - 1) { return half;}
          return empty;
        })}
      </span>
    )
  }