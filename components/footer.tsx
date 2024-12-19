import { siteConfig } from '@/config/site'
import { index } from 'cheerio/lib/api/traversing'
import React from 'react'
import { GithubIcon } from './icons'

type ElementType = {
    title : string,
    url : string
}

const Footer = () => {
    const elements : ElementType[] = [
        {title: "doksik", url: siteConfig.links.gdrive},
        {title: "profil", url: "/me"},
        {title: "llubok", url: "/clubs"},
        {title: "Insta", url: siteConfig.links.instagram},
        {title: "Események", url: "/events"},
        {title: "GitHub", url: siteConfig.links.github}
    ]

    const firstThree = elements.slice(0, 3)
    const lastThree = elements.slice(3, 6)

  return (
    <div className='bg-foreground-300 rounded-lg m-2 p-1' >
        <div className='grid grid-cols-4 grid-rows-2 justify-center'>
            {
                firstThree.map((element) => {
                    return(
                        <a key={element.title} href={element.url} className="m-1 items-center text-center flex flex-col h-16 bg-foreground-200 text-sm  rounded-lg text-selfprimary-900 hover:text-selfprimary-700">
                            
                            <GithubIcon size={40} className='text-xl' />

                            {element.title}
                        </a>  )
                    
                })
            }
        </div>
       
    </div>
  )
}

export default Footer